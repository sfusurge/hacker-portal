import { Suspense } from 'react';
import UserInfoForm from './UserInfoForm';

import { redirect } from 'next/navigation';
import { getUserData } from '@/app/(auth)/layout';

export default async function UserInfoPage() {
    const data = await getUserData();

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
