import { Suspense } from 'react';
import UserInfoForm from './UserInfoForm';

import { redirect } from 'next/navigation';
import { getCachedUserData } from '@/server/getCachedUserData';
import AuthLayoutFallback from '@/app/(auth)/AuthLayoutFallback';

export default function UserInfoPage() {
    return (
        <Suspense fallback={<AuthLayoutFallback />}>
            <UserInfoPageContent />
        </Suspense>
    );
}

async function UserInfoPageContent() {
    const data = await getCachedUserData();

    if (!data) {
        redirect('/signout');
    }

    if (data?.firstName && data.lastName && data.phoneNumber) {
        redirect('/home');
    }

    return <UserInfoForm />;
}
