import { auth } from '@/auth/auth';
import { expireAllAuthCookies } from '@/auth/expireAuthCookies';
import { safePortalReturnTarget } from '@/auth/returnTarget';
import { NextRequest, NextResponse } from 'next/server';

/** Invalidate the session and clear every auth cookie domain scope. */
export async function GET(request: NextRequest) {
    try {
        await auth.api.signOut({
            headers: request.headers,
        });
    } catch {
        // Still clear cookies below
    }

    const redirectTo =
        safePortalReturnTarget(request.nextUrl.searchParams.get('from')) ??
        '/login';
    const target = redirectTo.startsWith('http')
        ? redirectTo
        : new URL(redirectTo, request.nextUrl.origin).toString();

    const response = NextResponse.redirect(target);
    expireAllAuthCookies(request, response);
    return response;
}
