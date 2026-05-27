import type { UserDataType } from '@/app/(auth)/ClientContext';

/** Placeholder user for read-only public judge project pages (no auth). */
export const PUBLIC_JUDGE_VIEWER = {
    id: 0,
    email: '',
    image: null,
    firstName: 'Guest',
    lastName: '',
    phoneNumber: null,
    userRole: 'guest',
    displayId: null,
    lastSeenAnnouncementsAt: null,
} as unknown as UserDataType;
