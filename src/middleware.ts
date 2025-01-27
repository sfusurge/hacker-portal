import { auth } from '@/auth/auth';
import { NextRequest, NextResponse } from 'next/server';

export const middleware = auth((req) => {
    // do stuff with the req here
    console.log('test', req.nextUrl);
});

export const config = {
    matcher: '/:path*',
};
