import { NextResponse, type NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth/auth';

// Keep in sync with POSTHOG_API_HOST in src/lib/analytics/posthog.ts
const POSTHOG_PROXY_PATH = '/_sf';

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

function rewritePostHog(request: NextRequest) {
    const url = request.nextUrl.clone();
    const hostname =
        url.pathname.startsWith(`${POSTHOG_PROXY_PATH}/static/`) ||
        url.pathname.startsWith(`${POSTHOG_PROXY_PATH}/array/`)
            ? 'us-assets.i.posthog.com'
            : 'us.i.posthog.com';

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('host', hostname);
    // Don't forward app auth cookies to PostHog.
    requestHeaders.delete('cookie');

    url.protocol = 'https';
    url.hostname = hostname;
    url.port = '443';
    url.pathname = url.pathname.replace(/^\/_sf/, '');

    return NextResponse.rewrite(url, {
        headers: requestHeaders,
    });
}

export async function proxy(req: NextRequest) {
    const path = req.nextUrl.pathname;

    if (path.startsWith(POSTHOG_PROXY_PATH)) {
        return rewritePostHog(req);
    }

    const isMaintenance = process.env.MAINTENANCE === 'true';

    if (isMaintenance && req.nextUrl.pathname != '/maintenance') {
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
            return NextResponse.redirect(target, { status: 302 });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // PostHog reverse proxy (must include asset paths with file extensions)
        '/_sf/:path*',
        '/((?!_next/|.*\\..*).*)',
    ],
};
