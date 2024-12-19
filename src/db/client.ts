import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';

import postgres from 'postgres';

// NOTE: DO NOT, use "const env = process.env", as it does not work for clientside env variables.
// Nextjs statically analyse process.env.foo, assinging it variables messes with that.

// TODO figure out local supabase dev client.

const admin = drizzle(postgres(process.env.DATABASE_URL!, { prepare: false }));
// client is using the "postgres" role by default, which already bypasses RLS

// for more info: https://orm.drizzle.team/docs/rls#using-with-supabase
type SupabaseToken = {
  iss?: string;
  sub?: string;
  aud?: string[] | string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  role?: string;
};

export const databaseClient = {
  admin,
  rls: (async (transaction, token: SupabaseToken, ...rest) => {
    return await admin.transaction(
      async (tx) => {
        // apply token so that supabase's athu.jwt() and auth.uid() works
        try {
          // inject jwt values and set local role
          await tx.execute(sql`
                    -- inject auth.jwt(). set_config(setting_name, value, is_local);
                    select set_config('request.jwt.claims', '${sql.raw(JSON.stringify(token))}', TRUE);

                    --auth.uid(), note that .claim, NOT .claims
                    select set_config('request.jwt.claim.sub', '${sql.raw(token.sub ?? '')}', TRUE);

                    -- local role, default to anon if none provided.
                    set local role ${sql.raw(token.role ?? 'anon')};
                    `);

          // execute the actual transaction that is requested
          return await transaction(tx);
        } finally {
          // always revert back to initial role
          await tx.execute(sql`
                    select set_config('request.jwt.claims', NULL, TRUE);
                    select set_config('request.jwt.claim.sub', NULL, TRUE);
                    reset role;
                    `);
        }
      },
      ...rest
    );
  }) as typeof admin.transaction,
};
