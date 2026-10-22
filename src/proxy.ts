import { NextResponse, type NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth/auth';
import {
    expireLegacyPortalAuthCookies,
    migrateSessionCookieToSharedDomain,
} from '@/auth/expireAuthCookies';

// Since nextjs don't support proxy route groups yet.

const authRoutes = new Set([
    'application',
    'home',
    'admin',
    'schedule',
    'application',
]);

function getFirstSegment(str: string) {
    const idx = str.indexOf('/', 1);
    return str.substring(1, idx === -1 ? str.length : idx);
}

export async function proxy(req: NextRequest) {
    const path = req.nextUrl.pathname;

    const isMaintenance = process.env.MAINTENANCE === 'true';
    const allowDuringMaintenance =
        path === '/maintenance' ||
        path.startsWith('/api/cron') ||
        path.startsWith('/api/webhooks');

    if (isMaintenance && !allowDuringMaintenance) {
        const target = new URL('/maintenance', req.url);
        return NextResponse.redirect(target, { status: 302 });
    }

    if (authRoutes.has(getFirstSegment(path))) {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            const target = new URL('/login', req.url);
            target.searchParams.set('from', path);
            const response = NextResponse.redirect(target, { status: 302 });
            // Dual-cookie collision → clear portal host-only so login can work
            expireLegacyPortalAuthCookies(req, response);
            return response;
        }

        // TODO(cookie-migration): remove after all sessions are on .sfusurge.com
        const response = NextResponse.next();
        migrateSessionCookieToSharedDomain(req, response);
        return response;
    }

    if (path === '/login' || path.startsWith('/login/')) {
        const response = NextResponse.next();
        expireLegacyPortalAuthCookies(req, response);
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/|.*\\..*).*)'],
};
