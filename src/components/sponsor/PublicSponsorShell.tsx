'use client';

import ClientLayoutWrapper from '@/app/(auth)/ClientLayoutWrapper';
import { HackathonOnlyProvider } from '@/app/(auth)/ClientContext';
import MobileTopNav from '@/components/sidebar/MobileTopNav';
import SideBar from '@/components/sidebar/SideBar';
import type { UserData } from '@/server/routers/usersRouter';

type PublicHackathonData = Parameters<
    typeof HackathonOnlyProvider
>[0]['hackathonData'];

export default function PublicSponsorShell({
    sponsorName,
    hackathonData,
    children,
}: {
    sponsorName: string;
    hackathonData: PublicHackathonData;
    children: React.ReactNode;
}) {
    const publicSponsorUser = {
        id: -1,
        name: null,
        firstName: sponsorName || 'Sponsor',
        lastName: '',
        phoneNumber: null,
        email: 'sponsor@public.access',
        emailVerified: false,
        image: null,
        userRole: 'user',
        displayId: '000000',
        lastSeenAnnouncementsAt: null,
        createdAt: new Date(0),
        updatedAt: new Date(0),
    } as NonNullable<UserData>;

    return (
        <HackathonOnlyProvider hackathonData={hackathonData}>
            <ClientLayoutWrapper>
                <MobileTopNav
                    initialData={publicSponsorUser}
                    publicSponsorPortal
                >
                    <SideBar
                        initialData={publicSponsorUser}
                        publicSponsorPortal
                        className="h-full"
                    />
                </MobileTopNav>
                <main className="md:bg-neutral-925 mt-20 flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-auto overflow-y-auto p-6 md:mt-0 md:overflow-y-auto md:rounded-2xl md:border md:border-neutral-600/30 md:p-10">
                    {children}
                </main>
            </ClientLayoutWrapper>
        </HackathonOnlyProvider>
    );
}
