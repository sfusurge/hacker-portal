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
    let dbUser: UserTableType | undefined = undefined;

    if (authRoutes.has(getFirstSegment(path))) {
        const sessionUser = (await auth())?.user;
        // check if session exist
        if (sessionUser && sessionUser.email) {
            // check if user exist in db
            dbUser = (
                await databaseClient
                    .select()
                    .from(users)
                    .where(eq(users.email, sessionUser.email))
            )[0];
        }

        if (!dbUser) {
            const target = new URL('/login', req.url);
            target.searchParams.set('from', path);
            // user not logged in, and redirect after login
            return NextResponse.redirect(target, { status: 302 });
        }

        // user is valid, now check if is admin
        if (path.startsWith('/admin')) {
            if (dbUser.userRole !== UserRoleEnum.admin) {
                return NextResponse.rewrite(new URL('/not-found', req.url), {
                    status: 403,
                });
            }
        }
    }
});

export const config = {
    matcher: '/:path*',
};
