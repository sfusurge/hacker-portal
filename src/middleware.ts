import { auth } from '@/auth/auth';
import { NextRequest, NextResponse } from 'next/server';

// Since nextjs don't support middleware route groups yet.

const authRoutes = new Set(['application', 'home', 'admin']);

function getFirstSegment(str: string) {
    const idx = str.indexOf('/', 1);
    return str.substring(1, idx === -1 ? str.length : idx);
}

export const middleware = auth((req) => {
    // do stuff with the req here
    const path = req.nextUrl.pathname;

    if (authRoutes.has(getFirstSegment(path))) {
        console.log('TODO: check for auth user');
    }

    if (path.startsWith('/admin')) {
        console.log('TODO: check for admin permission');
    }
});

export const config = {
    matcher: '/:path*',
};
