import { sql } from 'drizzle-orm';
import { pgPolicy, PgRole, pgRole } from 'drizzle-orm/pg-core';

export const adminRole = pgRole('admin', {
  createRole: true,
  createDb: true,
  inherit: true,
}); // TODO give admin bypassrls with custom migration

export const userRole = pgRole('user');
export const auditorRole = pgRole('auditor');
export const anonRole = pgRole('anon').existing(); // role anon already exists in supabase

export type DbOperationVerb = 'select' | 'delete' | 'update' | 'insert' | 'all';
export function getPermsForRoles(roles: PgRole[], perms: DbOperationVerb[]) {
  return perms.map((perm) => {
    return pgPolicy(`${roles.map((r) => r.name).join(' ')}, can: ${perm}}`, {
      as: 'permissive',
      for: perm,
      to: roles,
      using: sql`true`, // allow access
      withCheck: sql`true`, // all roles are available
    });
  });
}

export function getPermForRole(role: PgRole, perm: DbOperationVerb) {
  return pgPolicy(`${role.name}, can: ${perm}}`, {
    as: 'permissive',
    for: perm,
    to: role,
    using: sql`true`, // allow access
    withCheck: sql`true`, // all roles are available
  });
}

/**
 * for access where a row has a col that equals the current user's id
 */
export function getCurrentUserPerms(
  role: PgRole,
  perms: DbOperationVerb[],
  colName: string
) {
  return perms.map((perm) => {
    return pgPolicy(`${role.name} can ${perm}`, {
      as: 'permissive',
      for: perm,
      to: role,
      using: sql`(select auth.uid()) = ${colName}`,
      withCheck:
        perm === 'insert' ? sql`(select auth.uid()) = ${colName}` : sql`true`,
    });
  });
}
