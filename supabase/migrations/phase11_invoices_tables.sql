-- Create invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  invoice_number TEXT NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal BIGINT NOT NULL, -- in cents
  tax_amount BIGINT NOT NULL DEFAULT 0, -- in cents
  total_amount BIGINT NOT NULL, -- in cents
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status invoice_status NOT NULL DEFAULT 'draft',
  payment_terms INTEGER NOT NULL DEFAULT 30, -- days
  notes TEXT,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, invoice_number)
);

-- Create invoice status enum
CREATE TYPE invoice_status AS ENUM (
  'draft',
  'sent', 
  'paid',
  'overdue',
  'cancelled'
);

-- Update invoices table to use the enum (need to recreate)
DROP TABLE IF EXISTS invoices;

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  invoice_number TEXT NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal BIGINT NOT NULL, -- in cents
  tax_amount BIGINT NOT NULL DEFAULT 0, -- in cents
  total_amount BIGINT NOT NULL, -- in cents
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status invoice_status NOT NULL DEFAULT 'draft',
  payment_terms INTEGER NOT NULL DEFAULT 30, -- days
  notes TEXT,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, invoice_number)
);

-- Create invoice items table  
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  time_entry_id UUID NOT NULL REFERENCES time_entries(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  marketing_channel TEXT NOT NULL,
  marketing_category TEXT NOT NULL,
  hours DECIMAL(10,2) NOT NULL,
  rate BIGINT NOT NULL, -- in cents
  amount BIGINT NOT NULL, -- in cents
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(invoice_id, time_entry_id)
);

-- Add invoice_id to time_entries table
ALTER TABLE time_entries 
ADD COLUMN invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_time_entry_id ON invoice_items(time_entry_id);

CREATE INDEX idx_time_entries_invoice_id ON time_entries(invoice_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_invoices_updated_at 
  BEFORE UPDATE ON invoices 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for invoices
CREATE POLICY "Users can view own invoices" 
  ON invoices FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices" 
  ON invoices FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices" 
  ON invoices FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own draft invoices" 
  ON invoices FOR DELETE 
  USING (auth.uid() = user_id AND status = 'draft');

-- Create RLS policies for invoice_items
CREATE POLICY "Users can view own invoice items" 
  ON invoice_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
        AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own invoice items" 
  ON invoice_items FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
        AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own invoice items" 
  ON invoice_items FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
        AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own invoice items" 
  ON invoice_items FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
        AND invoices.user_id = auth.uid()
        AND invoices.status = 'draft'
    )
  );

-- Grant necessary permissions
GRANT ALL ON invoices TO authenticated;
GRANT ALL ON invoice_items TO authenticated;