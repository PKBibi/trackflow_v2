-- =============================================
-- Fix Profiles Table - Alternative to Full Cleanup
-- Use this if you want to preserve data
-- =============================================

-- Check if profiles table exists and add missing columns
DO $$ 
BEGIN
    -- Check if profiles table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        
        -- Add username column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'profiles' 
                      AND column_name = 'username') THEN
            ALTER TABLE public.profiles ADD COLUMN username TEXT UNIQUE;
            RAISE NOTICE 'Added username column to profiles table';
        END IF;
        
        -- Add other potentially missing columns
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'profiles' 
                      AND column_name = 'bio') THEN
            ALTER TABLE public.profiles ADD COLUMN bio TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'profiles' 
                      AND column_name = 'phone') THEN
            ALTER TABLE public.profiles ADD COLUMN phone TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'profiles' 
                      AND column_name = 'location') THEN
            ALTER TABLE public.profiles ADD COLUMN location TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'profiles' 
                      AND column_name = 'website') THEN
            ALTER TABLE public.profiles ADD COLUMN website TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'profiles' 
                      AND column_name = 'linkedin') THEN
            ALTER TABLE public.profiles ADD COLUMN linkedin TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'profiles' 
                      AND column_name = 'github') THEN
            ALTER TABLE public.profiles ADD COLUMN github TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'profiles' 
                      AND column_name = 'twitter') THEN
            ALTER TABLE public.profiles ADD COLUMN twitter TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'profiles' 
                      AND column_name = 'timezone') THEN
            ALTER TABLE public.profiles ADD COLUMN timezone TEXT DEFAULT 'UTC';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'profiles' 
                      AND column_name = 'language') THEN
            ALTER TABLE public.profiles ADD COLUMN language TEXT DEFAULT 'en';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'profiles' 
                      AND column_name = 'job_title') THEN
            ALTER TABLE public.profiles ADD COLUMN job_title TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'profiles' 
                      AND column_name = 'company') THEN
            ALTER TABLE public.profiles ADD COLUMN company TEXT;
        END IF;
        
        -- Create index on username if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                      WHERE schemaname = 'public' 
                      AND tablename = 'profiles' 
                      AND indexname = 'idx_profiles_username') THEN
            CREATE INDEX idx_profiles_username ON public.profiles(username);
            RAISE NOTICE 'Created index on username column';
        END IF;
        
        RAISE NOTICE 'Profiles table fixed successfully';
    ELSE
        RAISE NOTICE 'Profiles table does not exist, will be created by main migration';
    END IF;
END $$;