import { auth } from '@/auth/auth';
import { NextRequest, NextResponse } from 'next/server';
import { databaseClient } from './db/client';
import { UserRoleEnum, users, UserTableType } from './db/schema/users';
import { eq } from 'drizzle-orm';

// Since nextjs don't support middleware route groups yet.

const authRoutes = new Set(['application', 'home', 'admin']);

function getFirstSegment(str: string) {
    const idx = str.indexOf('/', 1);
    return str.substring(1, idx === -1 ? str.length : idx);
}

export const middleware = auth(async (req) => {
    // do stuff with the req here
    const path = req.nextUrl.pathname;
    if (authRoutes.has(getFirstSegment(path))) {
        const sessionUser = (await auth())?.user;
        console.log('auth', sessionUser);
        // redirect unauthenticated users.
        if (!sessionUser) {
            const target = new URL('/login', req.url);
            target.searchParams.set('from', path);
            return NextResponse.redirect(target, { status: 302 });
        }
    }
});

export const config = {
    matcher: '/:path*',
};
