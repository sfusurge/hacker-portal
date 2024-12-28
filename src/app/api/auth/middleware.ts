import { databaseClient } from '@/db/client';
import { users } from '@/db/schema/users';
import { eq } from 'drizzle-orm';

export async function checkEmailExists(
  loginEmail: string,
  provider: string
): Promise<boolean> {
  const userQueryResult = await databaseClient
    .select()
    .from(users)
    .where(eq(users.email, loginEmail))
    .execute();

  if (userQueryResult.length > 0) {
    if (userQueryResult[0].provider !== provider) {
      return false;
    }
  }
  return true;
}

export async function createOAuthUser(email: string, provider: string) {
  const newUser = databaseClient
    .insert(users)
    .values({ email: email, provider: provider });
}
