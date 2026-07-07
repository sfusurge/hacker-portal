import { NextResponse, type NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth/auth';

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
    matcher: ['/((?!_next/|.*\\..*).*)'],
};
