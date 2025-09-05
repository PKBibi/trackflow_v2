-- =============================================
-- Phase 10: Marketing-Specific Core Tables
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. CLIENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic client info
  name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  phone TEXT,
  website TEXT,
  
  -- Address info
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  
  -- Billing info
  hourly_rate INTEGER, -- in cents
  currency TEXT DEFAULT 'USD',
  tax_rate DECIMAL(5,4) DEFAULT 0.0, -- e.g., 0.0825 for 8.25%
  
  -- Retainer management
  has_retainer BOOLEAN DEFAULT FALSE,
  retainer_hours INTEGER DEFAULT 0, -- monthly retainer hours
  retainer_amount INTEGER DEFAULT 0, -- monthly retainer amount in cents
  retainer_start_date DATE,
  retainer_end_date DATE,
  retainer_auto_renew BOOLEAN DEFAULT FALSE,
  
  -- Alert settings
  alert_at_75_percent BOOLEAN DEFAULT TRUE,
  alert_at_90_percent BOOLEAN DEFAULT TRUE,
  alert_at_100_percent BOOLEAN DEFAULT TRUE,
  
  -- Status and metadata
  status TEXT CHECK (status IN ('active', 'inactive', 'archived')) DEFAULT 'active',
  notes TEXT,
  tags TEXT[], -- for categorization
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for clients
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_clients_has_retainer ON public.clients(has_retainer);
CREATE INDEX idx_clients_name ON public.clients(name);

-- =============================================
-- 2. PROJECTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic project info
  name TEXT NOT NULL,
  description TEXT,
  
  -- Project details
  project_type TEXT, -- 'campaign', 'ongoing', 'one-time'
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  
  -- Budget and time tracking
  budget_type TEXT CHECK (budget_type IN ('hourly', 'fixed', 'retainer')) DEFAULT 'hourly',
  budget_amount INTEGER DEFAULT 0, -- in cents
  estimated_hours INTEGER DEFAULT 0,
  
  -- Campaign-specific fields
  campaign_id TEXT, -- Link to ad platform campaign ID
  campaign_platform TEXT, -- 'google-ads', 'meta-ads', 'linkedin-ads', etc.
  campaign_objective TEXT, -- 'awareness', 'conversions', 'traffic', etc.
  
  -- Timeline
  start_date DATE,
  end_date DATE,
  deadline DATE,
  
  -- Status
  status TEXT CHECK (status IN ('planning', 'active', 'paused', 'completed', 'cancelled')) DEFAULT 'planning',
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  
  -- Billing
  billable BOOLEAN DEFAULT TRUE,
  hourly_rate INTEGER, -- override client rate if needed, in cents
  
  -- Metadata
  notes TEXT,
  tags TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for projects
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_client_id ON public.projects(client_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_campaign_platform ON public.projects(campaign_platform);
CREATE INDEX idx_projects_deadline ON public.projects(deadline);

-- =============================================
-- 3. TIME_ENTRIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  
  -- Time tracking
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration INTEGER, -- in minutes, calculated field
  
  -- Marketing categorization
  marketing_category TEXT NOT NULL, -- 'content-seo', 'advertising-paid', etc.
  marketing_channel TEXT NOT NULL, -- 'google-ads', 'blog-writing', etc.
  
  -- Task details
  task_title TEXT,
  task_description TEXT,
  
  -- Campaign linking
  campaign_id TEXT, -- Link to specific campaign
  campaign_platform TEXT, -- Which platform this time was spent on
  
  -- Billing
  billable BOOLEAN DEFAULT TRUE,
  hourly_rate INTEGER NOT NULL, -- rate at time of entry, in cents
  amount INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN billable AND duration IS NOT NULL AND hourly_rate IS NOT NULL 
      THEN ROUND((duration::DECIMAL / 60) * hourly_rate)
      ELSE 0
    END
  ) STORED, -- calculated amount in cents
  
  -- Status and metadata
  status TEXT CHECK (status IN ('running', 'stopped', 'invoiced', 'paid')) DEFAULT 'stopped',
  is_timer_running BOOLEAN DEFAULT FALSE,
  
  -- Additional fields
  notes TEXT,
  tags TEXT[],
  screenshots TEXT[], -- URLs to screenshot files if enabled
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for time_entries
CREATE INDEX idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX idx_time_entries_client_id ON public.time_entries(client_id);
CREATE INDEX idx_time_entries_project_id ON public.time_entries(project_id);
CREATE INDEX idx_time_entries_start_time ON public.time_entries(start_time);
CREATE INDEX idx_time_entries_marketing_category ON public.time_entries(marketing_category);
CREATE INDEX idx_time_entries_marketing_channel ON public.time_entries(marketing_channel);
CREATE INDEX idx_time_entries_billable ON public.time_entries(billable);
CREATE INDEX idx_time_entries_status ON public.time_entries(status);
CREATE INDEX idx_time_entries_campaign_platform ON public.time_entries(campaign_platform);

-- =============================================
-- 4. INVOICES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  
  -- Invoice details
  invoice_number TEXT NOT NULL,
  title TEXT,
  description TEXT,
  
  -- Dates
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  period_start DATE,
  period_end DATE,
  
  -- Amounts
  subtotal INTEGER NOT NULL DEFAULT 0, -- in cents
  tax_rate DECIMAL(5,4) DEFAULT 0.0,
  tax_amount INTEGER GENERATED ALWAYS AS (ROUND(subtotal * tax_rate)) STORED,
  total_amount INTEGER GENERATED ALWAYS AS (subtotal + ROUND(subtotal * tax_rate)) STORED,
  
  -- Status
  status TEXT CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
  
  -- Payment info
  payment_date DATE,
  payment_method TEXT,
  payment_reference TEXT,
  
  -- Metadata
  notes TEXT,
  terms TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for invoices
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);

-- =============================================
-- 5. INVOICE_LINE_ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  time_entry_id UUID REFERENCES public.time_entries(id) ON DELETE SET NULL,
  
  -- Line item details
  description TEXT NOT NULL,
  marketing_channel TEXT, -- which channel this line item represents
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1, -- hours or units
  unit_type TEXT DEFAULT 'hours', -- 'hours', 'fixed', 'units'
  rate INTEGER NOT NULL, -- rate per unit in cents
  amount INTEGER GENERATED ALWAYS AS (ROUND(quantity * rate)) STORED,
  
  -- Dates for this line item
  service_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for invoice_line_items
CREATE INDEX idx_invoice_line_items_invoice_id ON public.invoice_line_items(invoice_id);
CREATE INDEX idx_invoice_line_items_time_entry_id ON public.invoice_line_items(time_entry_id);
CREATE INDEX idx_invoice_line_items_marketing_channel ON public.invoice_line_items(marketing_channel);

-- =============================================
-- 6. RETAINER_USAGE TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.retainer_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Period info
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Usage tracking
  allocated_hours INTEGER NOT NULL, -- hours allocated for this period
  used_hours DECIMAL(10,2) DEFAULT 0, -- hours used in this period
  usage_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN allocated_hours > 0 
      THEN ROUND((used_hours / allocated_hours) * 100, 2)
      ELSE 0
    END
  ) STORED,
  
  -- Alert tracking
  alert_75_sent BOOLEAN DEFAULT FALSE,
  alert_90_sent BOOLEAN DEFAULT FALSE,
  alert_100_sent BOOLEAN DEFAULT FALSE,
  
  -- Status
  status TEXT CHECK (status IN ('active', 'completed', 'rolled_over')) DEFAULT 'active',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for retainer_usage
CREATE INDEX idx_retainer_usage_client_id ON public.retainer_usage(client_id);
CREATE INDEX idx_retainer_usage_user_id ON public.retainer_usage(user_id);
CREATE INDEX idx_retainer_usage_period ON public.retainer_usage(period_start, period_end);
CREATE INDEX idx_retainer_usage_status ON public.retainer_usage(status);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON public.time_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_line_items_updated_at BEFORE UPDATE ON public.invoice_line_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_retainer_usage_updated_at BEFORE UPDATE ON public.retainer_usage 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retainer_usage ENABLE ROW LEVEL SECURITY;

-- Clients policies
CREATE POLICY "Users can view own clients" ON public.clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON public.clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON public.clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON public.clients
  FOR DELETE USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Time entries policies
CREATE POLICY "Users can view own time entries" ON public.time_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own time entries" ON public.time_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own time entries" ON public.time_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own time entries" ON public.time_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Invoices policies
CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices" ON public.invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices" ON public.invoices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices" ON public.invoices
  FOR DELETE USING (auth.uid() = user_id);

-- Invoice line items policies (inherit from invoice)
CREATE POLICY "Users can view own invoice line items" ON public.invoice_line_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE invoices.id = invoice_line_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own invoice line items" ON public.invoice_line_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE invoices.id = invoice_line_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own invoice line items" ON public.invoice_line_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE invoices.id = invoice_line_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own invoice line items" ON public.invoice_line_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE invoices.id = invoice_line_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

-- Retainer usage policies
CREATE POLICY "Users can view own retainer usage" ON public.retainer_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own retainer usage" ON public.retainer_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own retainer usage" ON public.retainer_usage
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own retainer usage" ON public.retainer_usage
  FOR DELETE USING (auth.uid() = user_id);