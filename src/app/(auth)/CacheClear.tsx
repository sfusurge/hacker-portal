'use client';

import { useEffect } from 'react';
import { MergedUserData } from './layout';

export function CacheClearer({ initialData }: { initialData: MergedUserData }) {
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
