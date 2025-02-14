'use client';

import { atom, useSetAtom } from 'jotai';
import { MergedUserData } from './layout';

export const userInfoAtom = atom<MergedUserData | undefined>(undefined);

export function ClientAuthContext({ userData }: { userData: MergedUserData }) {
    const setUserInfo = useSetAtom(userInfoAtom);
    setUserInfo(userData);

    return <></>;
}
