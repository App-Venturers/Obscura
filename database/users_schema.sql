-- Users Table and Profile Management Schema
-- Run this in your Supabase SQL Editor to create the users table and automatic profile creation

-- =============================================
-- Users Table (for user profiles)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    gamertag TEXT,
    discord TEXT,
    dob DATE,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    division TEXT,
    photo_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    onboarding BOOLEAN DEFAULT false,
    is_minor BOOLEAN DEFAULT false,
    platforms TEXT[], -- Array of gaming platforms
    languages TEXT[], -- Array of spoken languages
    software TEXT[], -- Array of software/tools
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Indexes for Performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_gamertag ON users(gamertag);
CREATE INDEX IF NOT EXISTS idx_users_onboarding ON users(onboarding);

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile and admins can read all
CREATE POLICY "Users can read own profile, admins can read all" ON users FOR SELECT USING (
    id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'superadmin')
    )
);

-- Users can update their own profile, admins can update all (except role changes)
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (
    id = auth.uid()
) WITH CHECK (
    id = auth.uid() AND
    (role = (SELECT role FROM users WHERE id = auth.uid())) -- Prevent role escalation
);

-- Only superadmins can update user roles
CREATE POLICY "Only superadmins can update roles" ON users FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'superadmin'
    )
);

-- Only admins can insert users (for bulk uploads)
CREATE POLICY "Only admins can insert users" ON users FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'superadmin')
    )
);

-- Only superadmins can delete users
CREATE POLICY "Only superadmins can delete users" ON users FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'superadmin'
    )
);

-- =============================================
-- Automatic User Profile Creation Trigger
-- =============================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role, onboarding)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        false
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- User already exists, ignore
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log error and continue
        RAISE WARNING 'Error creating user profile for %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- Updated At Trigger
-- =============================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row changes
DROP TRIGGER IF EXISTS update_users_updated_at_trigger ON users;
CREATE TRIGGER update_users_updated_at_trigger
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_users_updated_at();

-- =============================================
-- Helper Functions
-- =============================================

-- Function to safely get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT role FROM users WHERE id = user_id);
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'user';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = user_id
        AND role IN ('admin', 'superadmin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is superadmin
CREATE OR REPLACE FUNCTION is_superadmin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = user_id
        AND role = 'superadmin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Cleanup and Migration Functions
-- =============================================

-- Function to clean up orphaned auth users (users without profiles)
CREATE OR REPLACE FUNCTION cleanup_orphaned_auth_users()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    user_record RECORD;
BEGIN
    -- Only allow superadmins to run this
    IF NOT is_superadmin() THEN
        RAISE EXCEPTION 'Only superadmins can cleanup orphaned users';
    END IF;

    -- Find auth users without profiles
    FOR user_record IN
        SELECT au.id, au.email, au.created_at
        FROM auth.users au
        LEFT JOIN public.users pu ON au.id = pu.id
        WHERE pu.id IS NULL
        AND au.created_at < NOW() - INTERVAL '1 hour' -- Only cleanup users older than 1 hour
    LOOP
        -- Log the cleanup
        RAISE NOTICE 'Cleaning up orphaned auth user: % (%)', user_record.email, user_record.id;

        -- Delete the auth user (this will cascade to related tables)
        DELETE FROM auth.users WHERE id = user_record.id;
        deleted_count := deleted_count + 1;
    END LOOP;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create missing profiles for existing auth users
CREATE OR REPLACE FUNCTION create_missing_profiles()
RETURNS INTEGER AS $$
DECLARE
    created_count INTEGER := 0;
    user_record RECORD;
BEGIN
    -- Only allow superadmins to run this
    IF NOT is_superadmin() THEN
        RAISE EXCEPTION 'Only superadmins can create missing profiles';
    END IF;

    -- Find auth users without profiles
    FOR user_record IN
        SELECT au.id, au.email, au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN public.users pu ON au.id = pu.id
        WHERE pu.id IS NULL
        AND au.email_confirmed_at IS NOT NULL -- Only for confirmed users
    LOOP
        -- Create the missing profile
        BEGIN
            INSERT INTO public.users (id, email, role, onboarding)
            VALUES (
                user_record.id,
                user_record.email,
                COALESCE(user_record.raw_user_meta_data->>'role', 'user'),
                false
            );
            created_count := created_count + 1;
            RAISE NOTICE 'Created profile for user: % (%)', user_record.email, user_record.id;
        EXCEPTION
            WHEN unique_violation THEN
                -- Profile already exists, skip
                CONTINUE;
            WHEN OTHERS THEN
                RAISE WARNING 'Error creating profile for %: %', user_record.email, SQLERRM;
        END;
    END LOOP;

    RETURN created_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Usage Examples and Comments
-- =============================================

-- To run cleanup functions (only superadmins can execute these):
-- SELECT cleanup_orphaned_auth_users(); -- Removes auth users without profiles
-- SELECT create_missing_profiles();     -- Creates profiles for auth users without them

-- To check user roles programmatically:
-- SELECT get_user_role('uuid-here');
-- SELECT is_admin();
-- SELECT is_superadmin();

-- To view users without profiles:
-- SELECT au.email, au.created_at
-- FROM auth.users au
-- LEFT JOIN public.users pu ON au.id = pu.id
-- WHERE pu.id IS NULL;

-- To view profiles without auth users (shouldn't happen with proper constraints):
-- SELECT pu.email, pu.created_at
-- FROM public.users pu
-- LEFT JOIN auth.users au ON pu.id = au.id
-- WHERE au.id IS NULL;