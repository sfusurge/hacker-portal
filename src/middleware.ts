import { NextResponse } from 'next/server';
import { edgeAuth } from '@/auth/edgeAuth';

// Since nextjs don't support middleware route groups yet.

const authRoutes = new Set([
    'application',
    'home',
    'admin',
    'schedule',
    'application',
]);

// Add paths that should bypass auth checks even when signed in
const bypassAuthChecks = new Set([
    '/signout',
    '/api/auth/signout',
    '/login',
    '/api/auth/signin',
    '/api/auth/callback',
    '/api/auth/session',
    '/api/auth/csrf',
    '/login/userinfo',
]);

function getFirstSegment(str: string) {
    const idx = str.indexOf('/', 1);
    return str.substring(1, idx === -1 ? str.length : idx);
}

export const middleware = edgeAuth(async (req) => {
    // do stuff with the req here
    const path = req.nextUrl.pathname;

    // Skip auth checks for auth-related routes and static assets
    if (
        bypassAuthChecks.has(path) ||
        path.startsWith('/api/auth/') ||
        path.startsWith('/_next/') ||
        path.includes('.')
    ) {
        return NextResponse.next();
    }

    const isMaintenance = process.env.MAINTENANCE === 'true';

    if (isMaintenance && req.nextUrl.pathname != '/maintenance') {
        const target = new URL('/maintenance', req.url);
        return NextResponse.redirect(target, { status: 302 });
    } else {
        if (authRoutes.has(getFirstSegment(path))) {
            try {
                const session = await edgeAuth();
                const sessionUser = session?.user;

                // redirect unauthenticated users.
                if (!sessionUser) {
                    console.log('No session user, redirecting to login');
                    const target = new URL('/login', req.url);
                    // Only add from parameter if not already going to login
                    if (path !== '/login') {
                        target.searchParams.set('from', path);
                    }
                    return NextResponse.redirect(target, { status: 302 });
                }
            } catch (error) {
                console.error('Error in middleware auth check:', error);
                // Avoid redirect loops by checking if we're already on login
                if (path !== '/login') {
                    const target = new URL('/login', req.url);
                    target.searchParams.set('from', path);
                    return NextResponse.redirect(target, { status: 302 });
                }
                return NextResponse.next();
            }
        }
    }

    return NextResponse.next();
});
// export const config = {
//     matcher: ['/:path*'],
// };

export const config = {
    matcher: ['/((?!_next/|.*\\..*).*)'],
};
