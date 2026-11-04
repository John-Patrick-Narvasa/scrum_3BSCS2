-- ============================================================
-- S1-DBA-04: REPAIR PASSWORD RESET TOKEN TABLE
-- Migration 005 is recorded as applied, but its table is absent.
-- This migration restores the missing database object.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.password_reset_token (
    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    token_hash VARCHAR(64) NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,

    used BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    used_at TIMESTAMPTZ,

    CONSTRAINT password_reset_token_user_fk
        FOREIGN KEY (user_id)
        REFERENCES public.app_user (id)
        ON DELETE RESTRICT,

    CONSTRAINT password_reset_token_hash_unique
        UNIQUE (token_hash),

    CONSTRAINT password_reset_token_hash_format
        CHECK (token_hash ~ '^[0-9a-f]{64}$'),

    CONSTRAINT password_reset_token_expiry_check
        CHECK (expires_at > created_at),

    CONSTRAINT password_reset_token_used_check
        CHECK (
            (used = FALSE AND used_at IS NULL)
            OR
            (used = TRUE AND used_at IS NOT NULL)
        )
);

CREATE INDEX IF NOT EXISTS password_reset_token_user_expiry_idx
    ON public.password_reset_token (user_id, expires_at);

CREATE INDEX IF NOT EXISTS password_reset_token_pending_expiry_idx
    ON public.password_reset_token (expires_at)
    WHERE used = FALSE;

ALTER TABLE public.password_reset_token
    ENABLE ROW LEVEL SECURITY;