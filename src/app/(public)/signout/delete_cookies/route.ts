'use server';

import { cookies } from 'next/headers.js';

export async function POST(request: Request) {
    const c = await cookies();
    c.delete('__Secure-authjs.session-token');
    c.delete('authjs.session-token');

    return Response.json({});
}
