import { databaseClient } from '@/db/client';
import { users } from '@/db/schema/users';
import { eq } from 'drizzle-orm';

export async function checkEmailExists(loginEmail: string): Promise<Boolean> {
  const emailMatch = await databaseClient
    .select()
    .from(users)
    .where(eq(users.email, loginEmail))
    .execute();
  if (emailMatch.length === 0) {
    return false;
  }
  return true;
}
