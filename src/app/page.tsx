'use client';

import { redirect } from 'next/navigation';

export default function LandingPage() {
    // render nothing, always redirect to login for now

    redirect('/login');
}
