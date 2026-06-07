import { Suspense } from 'react';
import UserInfoForm from './UserInfoForm';

import { redirect } from 'next/navigation';
import { getCachedUserData } from '@/server/getCachedUserData';

export default async function UserInfoPage() {
    const data = await getCachedUserData();

    if (!data) {
        redirect('/signout');
    }

    if (data?.firstName && data.lastName && data.phoneNumber) {
        redirect('/home');
    }

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UserInfoForm />
        </Suspense>
    );
}
