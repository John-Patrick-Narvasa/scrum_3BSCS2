-- =====================================================================
-- Migration: 004_auth_sync_trigger.sql
-- Goal: Automated Supabase auth.users -> public.app_user sync trigger,
--       employee (empno) linkage, and role-based access control tables.
-- =====================================================================

-- 1. Create app_user table if not exists
CREATE TABLE IF NOT EXISTS public.app_user (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username    VARCHAR(30) UNIQUE NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    full_name   VARCHAR(100) NOT NULL,
    empno       VARCHAR(5) REFERENCES public.employee(empno) ON DELETE SET NULL,
    role        VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('superadmin', 'admin', 'user')),
    status      VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'blocked')),
    approved_by VARCHAR(50),
    approved_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    stamp       VARCHAR(60),
    is_deleted  BOOLEAN NOT NULL DEFAULT FALSE
);

-- 2. Create user_permission table for 40 granular rights
CREATE TABLE IF NOT EXISTS public.user_permission (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES public.app_user(id) ON DELETE CASCADE,
    module      VARCHAR(30) NOT NULL,
    right_code  VARCHAR(30) NOT NULL,
    granted_by  VARCHAR(50),
    granted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_right UNIQUE (user_id, right_code)
);

-- 3. Trigger Function: Sync auth.users -> public.app_user
-- Runs automatically whenever a new user registers via Supabase auth.signUp()
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_username  VARCHAR(30);
    v_full_name VARCHAR(100);
    v_empno     VARCHAR(5);
    v_role      VARCHAR(20);
    v_status    VARCHAR(20);
    v_stamp     VARCHAR(60);
BEGIN
    -- Extract metadata supplied during signUp()
    v_username  := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'fullName', v_username);
    v_empno     := NULLIF(TRIM(NEW.raw_user_meta_data->>'empno'), '');
    v_role      := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
    v_status    := COALESCE(NEW.raw_user_meta_data->>'status', 'pending');

    -- Verify empno exists in employee table if supplied; otherwise set NULL
    IF v_empno IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.employee WHERE empno = v_empno) THEN
        v_empno := NULL;
    END IF;

    -- Generate initial audit stamp
    v_stamp := 'ADD system ' || to_char(now() AT TIME ZONE 'Asia/Manila', 'YYYY-MM-DD HH12:MI AM');

    -- Insert into app_user
    INSERT INTO public.app_user (
        id,
        username,
        email,
        full_name,
        empno,
        role,
        status,
        stamp,
        created_at
    ) VALUES (
        NEW.id,
        v_username,
        NEW.email,
        v_full_name,
        v_empno,
        v_role,
        v_status,
        v_stamp,
        now()
    )
    ON CONFLICT (id) DO UPDATE
    SET
        username  = EXCLUDED.username,
        email     = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        empno     = COALESCE(EXCLUDED.empno, public.app_user.empno);

    -- Log to audit_log
    INSERT INTO public.audit_log (table_name, action, record_key, old_values, new_values, action_by, action_at)
    VALUES (
        'app_user',
        'ADD',
        v_username,
        NULL,
        jsonb_build_object('id', NEW.id, 'username', v_username, 'email', NEW.email, 'status', v_status),
        'system',
        now()
    );

    RETURN NEW;
END;
$$;

-- 4. Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.app_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permission ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.app_user;
CREATE POLICY "Users can view own profile"
    ON public.app_user
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Admins and superadmins can view all active and pending users
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.app_user;
CREATE POLICY "Admins can view all profiles"
    ON public.app_user
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.app_user u
            WHERE u.id = auth.uid()
              AND u.role IN ('admin', 'superadmin')
              AND u.status = 'active'
        )
    );

-- Policy: Public read for username / email check during registration
DROP POLICY IF EXISTS "Allow username check during onboarding" ON public.app_user;
CREATE POLICY "Allow username check during onboarding"
    ON public.app_user
    FOR SELECT
    USING (true);
