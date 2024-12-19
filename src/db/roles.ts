import { pgRole } from 'drizzle-orm/pg-core';

export const adminRole = pgRole('admin', {
  createRole: true,
  createDb: true,
  inherit: true,
});
export const userRole = pgRole('user');
export const auditorRole = pgRole('auditor');
export const anon = pgRole('anon').existing(); // role anon already exists in supabase
