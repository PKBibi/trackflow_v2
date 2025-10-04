-- =============================================
-- Fix Enum Type Conflict - Minimal Fix
-- Use this if you only have the enum type error
-- This preserves all data and tables
-- =============================================

DO $$ 
BEGIN
    -- Check if invoice_status enum exists and drop it
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
        -- First, we need to drop any columns using this type
        -- Check if invoices table exists and has status column
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'invoices' 
                  AND column_name = 'status') THEN
            
            -- Temporarily change the column to text
            ALTER TABLE public.invoices 
            ALTER COLUMN status TYPE TEXT;
            
            RAISE NOTICE 'Temporarily converted invoices.status to TEXT';
        END IF;
        
        -- Now we can safely drop the enum
        DROP TYPE invoice_status CASCADE;
        RAISE NOTICE 'Dropped existing invoice_status enum type';
        
        -- Recreate the enum with correct values
        CREATE TYPE invoice_status AS ENUM (
          'draft',
          'sent', 
          'paid',
          'overdue',
          'cancelled'
        );
        RAISE NOTICE 'Recreated invoice_status enum type';
        
        -- Convert the column back to enum if it exists
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'invoices' 
                  AND column_name = 'status') THEN
            
            -- Convert back to enum, handling any invalid values
            UPDATE public.invoices 
            SET status = 'sent' 
            WHERE status = 'viewed';  -- Fix any 'viewed' values from old migration
            
            ALTER TABLE public.invoices 
            ALTER COLUMN status TYPE invoice_status 
            USING status::invoice_status;
            
            RAISE NOTICE 'Converted invoices.status back to enum type';
        END IF;
    ELSE
        RAISE NOTICE 'invoice_status enum does not exist, will be created by main migration';
    END IF;
END $$;