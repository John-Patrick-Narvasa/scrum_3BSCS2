
-- ============================================================
-- S1-DBA-03: ACCESS CONTROL TABLES
-- Hope, Inc. ERP
--
-- Creates:
--   role
--   module
--   rights_catalogue
--   app_user
--   user_module
--   user_permission
--
-- Catalogue and account seed data are handled separately
-- by S1-DBA-05.
-- ============================================================


-- 1. ROLE CATALOGUE
-- Allowed roles are seeded in S1-DBA-05.

CREATE TABLE public.role (
    role_code VARCHAR(20) PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,

    CONSTRAINT role_code_check
        CHECK (role_code IN ('superadmin', 'admin', 'user'))
);


-- 2. MODULE CATALOGUE
-- The six business modules are seeded in S1-DBA-05.

CREATE TABLE public.module (
    module_code VARCHAR(20) PRIMARY KEY,
    module_name VARCHAR(60) NOT NULL UNIQUE,
    description TEXT,

    CONSTRAINT module_code_check
        CHECK (
            module_code IN (
                'customer',
                'product',
                'hr',
                'sales',
                'reports',
                'payment'
            )
        )
);


-- 3. RIGHTS CATALOGUE
-- The 40 canonical rights are seeded in S1-DBA-05.

CREATE TABLE public.rights_catalogue (
    right_code VARCHAR(30) PRIMARY KEY,
    module_code VARCHAR(20) NOT NULL,
    right_name VARCHAR(100) NOT NULL,
    description TEXT,

    CONSTRAINT rights_catalogue_module_fk
        FOREIGN KEY (module_code)
        REFERENCES public.module (module_code)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT rights_catalogue_module_right_unique
        UNIQUE (module_code, right_code)
);


-- 4. APPLICATION USERS
-- id refers to the corresponding Supabase Auth user.
-- Passwords are managed by Supabase Auth and are NOT stored here.
--
-- status:
--   pending = awaiting approval
--   active  = approved and enabled
--   blocked = access blocked
--
-- is_blocked is generated from status so the two values
-- cannot contradict one another.
--
-- record_status is separate from account status:
--   ACTIVE / INACTIVE = soft-delete state of the profile.

CREATE TABLE public.app_user (
    id UUID PRIMARY KEY,

    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,

    role VARCHAR(20) NOT NULL,

    status VARCHAR(10) NOT NULL DEFAULT 'pending',

    is_blocked BOOLEAN
        GENERATED ALWAYS AS (status = 'blocked') STORED,

    approved_by UUID,
    approved_at TIMESTAMPTZ,

    record_status VARCHAR(8) NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    stamp VARCHAR(100),

    CONSTRAINT app_user_auth_user_fk
        FOREIGN KEY (id)
        REFERENCES auth.users (id)
        ON DELETE RESTRICT,

    CONSTRAINT app_user_role_fk
        FOREIGN KEY (role)
        REFERENCES public.role (role_code)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT app_user_approved_by_fk
        FOREIGN KEY (approved_by)
        REFERENCES public.app_user (id)
        ON DELETE RESTRICT,

    CONSTRAINT app_user_status_check
        CHECK (status IN ('pending', 'active', 'blocked')),

    CONSTRAINT app_user_record_status_check
        CHECK (record_status IN ('ACTIVE', 'INACTIVE')),

    CONSTRAINT app_user_approval_fields_check
        CHECK (
            (approved_by IS NULL AND approved_at IS NULL)
            OR
            (approved_by IS NOT NULL AND approved_at IS NOT NULL)
        ),

    CONSTRAINT app_user_username_nonblank
        CHECK (BTRIM(username) <> ''),

    CONSTRAINT app_user_email_nonblank
        CHECK (BTRIM(email) <> ''),

    CONSTRAINT app_user_full_name_nonblank
        CHECK (BTRIM(full_name) <> '')
);


-- Case-insensitive uniqueness for usernames and email addresses.

CREATE UNIQUE INDEX app_user_username_lower_unique
    ON public.app_user (LOWER(BTRIM(username)));

CREATE UNIQUE INDEX app_user_email_lower_unique
    ON public.app_user (LOWER(BTRIM(email)));


-- 5. USER MODULE ASSIGNMENTS
-- Controls access to an entire application module.
-- Inactivation is a soft delete; the row can be restored.

CREATE TABLE public.user_module (
    user_id UUID NOT NULL,
    module_code VARCHAR(20) NOT NULL,

    record_status VARCHAR(8) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    stamp VARCHAR(100),

    CONSTRAINT user_module_pk
        PRIMARY KEY (user_id, module_code),

    CONSTRAINT user_module_user_fk
        FOREIGN KEY (user_id)
        REFERENCES public.app_user (id)
        ON DELETE RESTRICT,

    CONSTRAINT user_module_module_fk
        FOREIGN KEY (module_code)
        REFERENCES public.module (module_code)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT user_module_record_status_check
        CHECK (record_status IN ('ACTIVE', 'INACTIVE'))
);


-- 6. USER PERMISSION ASSIGNMENTS
-- Controls individual rights.
-- Each right must belong to a module assigned to the user.
-- Inactivation is a soft delete; the row can be restored.

CREATE TABLE public.user_permission (
    user_id UUID NOT NULL,
    module_code VARCHAR(20) NOT NULL,
    right_code VARCHAR(30) NOT NULL,

    record_status VARCHAR(8) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    stamp VARCHAR(100),

    CONSTRAINT user_permission_pk
        PRIMARY KEY (user_id, right_code),

    CONSTRAINT user_permission_user_module_fk
        FOREIGN KEY (user_id, module_code)
        REFERENCES public.user_module (user_id, module_code)
        ON DELETE RESTRICT,

    CONSTRAINT user_permission_module_right_fk
        FOREIGN KEY (module_code, right_code)
        REFERENCES public.rights_catalogue (module_code, right_code)
        ON DELETE RESTRICT,

    CONSTRAINT user_permission_record_status_check
        CHECK (record_status IN ('ACTIVE', 'INACTIVE'))
);


-- 7. INDEXES FOR COMMON LOOKUPS

CREATE INDEX user_module_module_code_idx
    ON public.user_module (module_code);

CREATE INDEX user_permission_right_code_idx
    ON public.user_permission (right_code);

CREATE INDEX app_user_role_idx
    ON public.app_user (role);

CREATE INDEX app_user_status_idx
    ON public.app_user (status);


-- 8. ENABLE ROW LEVEL SECURITY
-- Policies will be added as part of the authorization implementation.
-- With no policies, access through ordinary authenticated/anon
-- PostgREST roles is denied by default.

ALTER TABLE public.role ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rights_catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permission ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- END S1-DBA-03
-- ============================================================
