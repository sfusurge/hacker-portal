import { getServerSession } from 'next-auth';
import SessionProvider from './SessionProvider';

interface NextAuthSessionProviderProps {
  readonly children: React.ReactNode;
}

async function NextAuthSessionProvider({
  children,
}: NextAuthSessionProviderProps) {
  const session = await getServerSession();
  return <SessionProvider session={session}>{children}</SessionProvider>;
}

export { NextAuthSessionProvider };
export type { NextAuthSessionProviderProps };
