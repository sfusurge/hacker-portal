import { databaseClient } from '@/db/client';
import { users } from '@/db/schema/users';
import { eq } from 'drizzle-orm';

export type AuthenticationErrorTypes = {
  UserDoesNotExist: 'User Does Not Exist';
  ProviderMismatch: 'User attempted to sign-in with a different provider under the same email';
};

export type AuthenticationErrorType = keyof AuthenticationErrorTypes; // 'UserDoesNotExist' | 'ProviderMismatch'

export interface AuthenticationError extends Error {
  name: 'Authentication Error';
  type: AuthenticationErrorType;
  userId?: string;
}

function AuthenticationError(
  msg: string,
  errorType: AuthenticationErrorType,
  userId?: string
): AuthenticationError {
  const error = new Error(msg) as AuthenticationError;
  error.name = 'Authentication Error';
  error.type = errorType;
  error.userId = userId;
  return error;
}

export async function validateUser(
  loginEmail: string,
  provider: string
): Promise<boolean | string> {
  const userQueryResult = await databaseClient
    .select()
    .from(users)
    .where(eq(users.email, loginEmail));

  if (userQueryResult.length === 0) return 'DNE';
  if (userQueryResult[0].provider !== provider) return 'ProviderMismatch';
  return true;
}

export async function createOAuthUser(email: string, provider: string) {
  const newUser = databaseClient
    .insert(users)
    .values({ email: email, provider: provider, isRegistered: false });
}
