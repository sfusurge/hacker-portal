'use client';

import { UserData } from '@/db/schema/users/users';
import { useEffect } from 'react';

export function CacheClearer({ initialData }: { initialData: UserData }) {
    useEffect(() => {
        if (
            localStorage.getItem('email') &&
            localStorage.getItem('email') !== initialData?.email
        ) {
            localStorage.clear();
        }
    }, [initialData]);
    return <></>;
}
