import { getServerSession } from 'next-auth';
import SessionProvider from './SessionProvider';

export default async function NextAuthSessionProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession();
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
