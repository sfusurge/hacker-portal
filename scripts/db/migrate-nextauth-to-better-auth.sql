-- Migrate NextAuth (Auth.js) auth tables to Better Auth schema.
--
-- Run BEFORE `pnpm drizzle:push` to preserve OAuth account links and
-- pending verification tokens.
--
-- Usage:
--   psql "$DBURL" -f scripts/db/migrate-nextauth-to-better-auth.sql
--   # or
--   pnpm db:migrate-auth
--
-- After this script succeeds, run:
--   pnpm drizzle:push
--
-- drizzle:push should only apply minor diffs (if any), not destructive changes.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. user: emailVerified timestamp -> boolean
-- ---------------------------------------------------------------------------

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'user'
          AND column_name = 'emailVerified'
          AND data_type IN ('timestamp without time zone', 'timestamp with time zone')
    ) THEN
        ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "emailVerified_new" boolean;

        UPDATE "user"
        SET "emailVerified_new" = ("emailVerified" IS NOT NULL)
        WHERE "emailVerified_new" IS NULL;

        ALTER TABLE "user" DROP COLUMN "emailVerified";
        ALTER TABLE "user" RENAME COLUMN "emailVerified_new" TO "emailVerified";
        ALTER TABLE "user" ALTER COLUMN "emailVerified" SET DEFAULT false;
        ALTER TABLE "user" ALTER COLUMN "emailVerified" SET NOT NULL;
    END IF;
END $$;

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "createdAt" timestamp;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp;

UPDATE "user"
SET
    "createdAt" = COALESCE("createdAt", NOW()),
    "updatedAt" = COALESCE("updatedAt", NOW());

ALTER TABLE "user" ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE "user" ALTER COLUMN "updatedAt" SET DEFAULT NOW();
ALTER TABLE "user" ALTER COLUMN "createdAt" SET NOT NULL;
ALTER TABLE "user" ALTER COLUMN "updatedAt" SET NOT NULL;

-- ---------------------------------------------------------------------------
-- 2. account: NextAuth columns -> Better Auth columns
-- ---------------------------------------------------------------------------

DO $$
DECLARE
    pk_name text;
BEGIN
    IF to_regclass('public.account') IS NULL THEN
        RAISE NOTICE 'account table not found, skipping';
        RETURN;
    END IF;

    SELECT constraint_name
    INTO pk_name
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'account'
      AND constraint_type = 'PRIMARY KEY'
    LIMIT 1;

    IF pk_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE account DROP CONSTRAINT %I', pk_name);
    END IF;
END $$;

ALTER TABLE account ADD COLUMN IF NOT EXISTS id text;
ALTER TABLE account ADD COLUMN IF NOT EXISTS "accountId" text;
ALTER TABLE account ADD COLUMN IF NOT EXISTS "providerId" text;
ALTER TABLE account ADD COLUMN IF NOT EXISTS "accessToken" text;
ALTER TABLE account ADD COLUMN IF NOT EXISTS "refreshToken" text;
ALTER TABLE account ADD COLUMN IF NOT EXISTS "accessTokenExpiresAt" timestamp;
ALTER TABLE account ADD COLUMN IF NOT EXISTS "refreshTokenExpiresAt" timestamp;
ALTER TABLE account ADD COLUMN IF NOT EXISTS "idToken" text;
ALTER TABLE account ADD COLUMN IF NOT EXISTS password text;
ALTER TABLE account ADD COLUMN IF NOT EXISTS "createdAt" timestamp;
ALTER TABLE account ADD COLUMN IF NOT EXISTS "updatedAt" timestamp;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'account'
          AND column_name = 'providerAccountId'
    ) THEN
        UPDATE account
        SET
            id = COALESCE(id, gen_random_uuid()::text),
            "accountId" = COALESCE("accountId", "providerAccountId"),
            "providerId" = COALESCE("providerId", provider),
            "accessToken" = COALESCE("accessToken", access_token),
            "refreshToken" = COALESCE("refreshToken", refresh_token),
            "accessTokenExpiresAt" = COALESCE(
                "accessTokenExpiresAt",
                CASE
                    WHEN expires_at IS NOT NULL THEN to_timestamp(expires_at)
                    ELSE NULL
                END
            ),
            "idToken" = COALESCE("idToken", id_token),
            "createdAt" = COALESCE("createdAt", NOW()),
            "updatedAt" = COALESCE("updatedAt", NOW());
    ELSE
        UPDATE account
        SET
            id = COALESCE(id, gen_random_uuid()::text),
            "createdAt" = COALESCE("createdAt", NOW()),
            "updatedAt" = COALESCE("updatedAt", NOW());
    END IF;
END $$;

ALTER TABLE account DROP COLUMN IF EXISTS type;
ALTER TABLE account DROP COLUMN IF EXISTS provider;
ALTER TABLE account DROP COLUMN IF EXISTS "providerAccountId";
ALTER TABLE account DROP COLUMN IF EXISTS refresh_token;
ALTER TABLE account DROP COLUMN IF EXISTS access_token;
ALTER TABLE account DROP COLUMN IF EXISTS expires_at;
ALTER TABLE account DROP COLUMN IF EXISTS token_type;
ALTER TABLE account DROP COLUMN IF EXISTS id_token;
ALTER TABLE account DROP COLUMN IF EXISTS session_state;

ALTER TABLE account ALTER COLUMN id SET NOT NULL;
ALTER TABLE account ALTER COLUMN "accountId" SET NOT NULL;
ALTER TABLE account ALTER COLUMN "providerId" SET NOT NULL;
ALTER TABLE account ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE account ALTER COLUMN "updatedAt" SET DEFAULT NOW();
ALTER TABLE account ALTER COLUMN "createdAt" SET NOT NULL;
ALTER TABLE account ALTER COLUMN "updatedAt" SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'account_pkey'
          AND conrelid = 'account'::regclass
    ) THEN
        ALTER TABLE account ADD CONSTRAINT account_pkey PRIMARY KEY (id);
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 3. session: NextAuth columns -> Better Auth columns
-- ---------------------------------------------------------------------------

DO $$
DECLARE
    pk_name text;
BEGIN
    IF to_regclass('public.session') IS NULL THEN
        RAISE NOTICE 'session table not found, skipping';
        RETURN;
    END IF;

    SELECT constraint_name
    INTO pk_name
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'session'
      AND constraint_type = 'PRIMARY KEY'
    LIMIT 1;

    IF pk_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE session DROP CONSTRAINT %I', pk_name);
    END IF;
END $$;

ALTER TABLE session ADD COLUMN IF NOT EXISTS id text;
ALTER TABLE session ADD COLUMN IF NOT EXISTS token text;
ALTER TABLE session ADD COLUMN IF NOT EXISTS "expiresAt" timestamp;
ALTER TABLE session ADD COLUMN IF NOT EXISTS "ipAddress" text;
ALTER TABLE session ADD COLUMN IF NOT EXISTS "userAgent" text;
ALTER TABLE session ADD COLUMN IF NOT EXISTS "createdAt" timestamp;
ALTER TABLE session ADD COLUMN IF NOT EXISTS "updatedAt" timestamp;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'session'
          AND column_name = 'sessionToken'
    ) THEN
        UPDATE session
        SET
            id = COALESCE(id, gen_random_uuid()::text),
            token = COALESCE(token, "sessionToken"),
            "expiresAt" = COALESCE("expiresAt", expires),
            "createdAt" = COALESCE("createdAt", NOW()),
            "updatedAt" = COALESCE("updatedAt", NOW());
    ELSE
        UPDATE session
        SET
            id = COALESCE(id, gen_random_uuid()::text),
            "createdAt" = COALESCE("createdAt", NOW()),
            "updatedAt" = COALESCE("updatedAt", NOW());
    END IF;
END $$;

ALTER TABLE session DROP COLUMN IF EXISTS "sessionToken";
ALTER TABLE session DROP COLUMN IF EXISTS expires;

ALTER TABLE session ALTER COLUMN id SET NOT NULL;
ALTER TABLE session ALTER COLUMN token SET NOT NULL;
ALTER TABLE session ALTER COLUMN "expiresAt" SET NOT NULL;
ALTER TABLE session ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE session ALTER COLUMN "updatedAt" SET DEFAULT NOW();
ALTER TABLE session ALTER COLUMN "createdAt" SET NOT NULL;
ALTER TABLE session ALTER COLUMN "updatedAt" SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'session_pkey'
          AND conrelid = 'session'::regclass
    ) THEN
        ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (id);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'session_token_unique'
          AND conrelid = 'session'::regclass
    ) THEN
        ALTER TABLE session ADD CONSTRAINT session_token_unique UNIQUE (token);
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 4. verificationToken -> verification
-- ---------------------------------------------------------------------------

DO $$
BEGIN
    IF to_regclass('public.verification') IS NOT NULL THEN
        RAISE NOTICE 'verification table already exists, skipping rename';
    ELSIF to_regclass('public."verificationToken"') IS NOT NULL THEN
        ALTER TABLE "verificationToken" RENAME TO verification;
    ELSE
        RAISE NOTICE 'verificationToken table not found, skipping';
    END IF;
END $$;

DO $$
DECLARE
    pk_name text;
BEGIN
    IF to_regclass('public.verification') IS NULL THEN
        RETURN;
    END IF;

    SELECT constraint_name
    INTO pk_name
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'verification'
      AND constraint_type = 'PRIMARY KEY'
    LIMIT 1;

    IF pk_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE verification DROP CONSTRAINT %I', pk_name);
    END IF;
END $$;

ALTER TABLE verification ADD COLUMN IF NOT EXISTS id text;
ALTER TABLE verification ADD COLUMN IF NOT EXISTS "expiresAt" timestamp;
ALTER TABLE verification ADD COLUMN IF NOT EXISTS "createdAt" timestamp;
ALTER TABLE verification ADD COLUMN IF NOT EXISTS "updatedAt" timestamp;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'verification'
          AND column_name = 'token'
    ) THEN
        ALTER TABLE verification RENAME COLUMN token TO value;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'verification'
          AND column_name = 'expires'
    ) THEN
        UPDATE verification
        SET
            id = COALESCE(id, gen_random_uuid()::text),
            "expiresAt" = COALESCE("expiresAt", expires),
            "createdAt" = COALESCE("createdAt", NOW()),
            "updatedAt" = COALESCE("updatedAt", NOW());
    ELSE
        UPDATE verification
        SET
            id = COALESCE(id, gen_random_uuid()::text),
            "createdAt" = COALESCE("createdAt", NOW()),
            "updatedAt" = COALESCE("updatedAt", NOW());
    END IF;
END $$;

ALTER TABLE verification DROP COLUMN IF EXISTS expires;

ALTER TABLE verification ALTER COLUMN id SET NOT NULL;
ALTER TABLE verification ALTER COLUMN identifier SET NOT NULL;
ALTER TABLE verification ALTER COLUMN value SET NOT NULL;
ALTER TABLE verification ALTER COLUMN "expiresAt" SET NOT NULL;
ALTER TABLE verification ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE verification ALTER COLUMN "updatedAt" SET DEFAULT NOW();
ALTER TABLE verification ALTER COLUMN "createdAt" SET NOT NULL;
ALTER TABLE verification ALTER COLUMN "updatedAt" SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'verification_pkey'
          AND conrelid = 'verification'::regclass
    ) THEN
        ALTER TABLE verification ADD CONSTRAINT verification_pkey PRIMARY KEY (id);
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 5. Drop unused NextAuth passkey table (not used by Better Auth in this app)
-- ---------------------------------------------------------------------------

DROP TABLE IF EXISTS authenticator;

COMMIT;
