import { databaseClient } from '@/db/client';
import { users } from '@/db/schema/users';
import { eq } from 'drizzle-orm';

export async function checkEmailExists(loginEmail: string): Promise<boolean> {
  const userQueryResult = await databaseClient
    .select()
    .from(users)
    .where(eq(users.email, loginEmail))
    .execute();

  return userQueryResult.length > 0;
}
