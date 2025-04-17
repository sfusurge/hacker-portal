'use client';

import { UserData } from '@/db/schema/users/users';
import { atom, useSetAtom } from 'jotai';
import { useLayoutEffect } from 'react';

export const userInfoAtom = atom<UserData | undefined>(undefined);

export function ClientAuthContext({ userData }: { userData: UserData }) {
    const setUserInfo = useSetAtom(userInfoAtom);
    useLayoutEffect(() => {
        setUserInfo(userData);
    }, []);

    return <></>;
}
