import { getServerSession } from 'next-auth';
import SessionProvider from './SessionProvider';

interface NextAuthSessionProviderProps {
    readonly children: React.ReactNode;
}

/**
 * Provides authentication session data to the application.
 *
 * This component wraps its children in a `SessionProvider` that supplies
 * the authentication session obtained via `getServerSession`.
 *
 * @async
 * @function NextAuthSessionProvider
 * @param {NextAuthSessionProviderProps} props - The props for the provider component.
 * @returns {JSX.Element} A `SessionProvider` component with the current session data.
 *
 * @example
 * ```tsx
 * import NextAuthSessionProvider from './NextAuthSessionProvider';
 *
 * function App() {
 *   return (
 *     <NextAuthSessionProvider>
 *       <Component1 />
 *       <Component2 />
 *        ...
 *     </NextAuthSessionProvider>
 *   );
 * }
 * ```
 */
async function NextAuthSessionProvider({
    children,
}: NextAuthSessionProviderProps) {
    const session = await getServerSession();
    return <SessionProvider session={session}>{children}</SessionProvider>;
}

export { NextAuthSessionProvider };
export type { NextAuthSessionProviderProps };
