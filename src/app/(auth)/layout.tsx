import { ReactNode } from 'react';
import { CacheClearer } from '@/app/(auth)/CacheClear';
import { redirect } from 'next/navigation';
import { ClientContext } from './ClientContext';
import { getCachedUserData } from '@/server/getCachedUserData';
import { getCachedActiveHackathon } from '@/server/getCachedActiveHackathon';
import { getInitialAnnouncements } from '@/server/getInitialAnnouncements';
import { getViewerAnnouncementLocationKey } from '@/server/announcements/fetchAnnouncementsForViewer';
import ClientLayoutWrapper from './ClientLayoutWrapper';
import MobileTopNav from '@/components/sidebar/MobileTopNav';
import SideBar from '@/components/sidebar/SideBar';

export default async function Layout({ children }: { children: ReactNode }) {
    const [hackathon, userData] = await Promise.all([
        getCachedActiveHackathon(),
        getCachedUserData(),
    ]);

    if (!userData) {
        return redirect('/signout');
    }

    const [
        { items: initialAnnouncements },
        initialViewerAnnouncementLocationKey,
    ] = await Promise.all([
        hackathon != null
            ? getInitialAnnouncements(
                  hackathon.id,
                  userData.id,
                  userData.userRole === 'admin'
              )
            : Promise.resolve({ items: [], hasMore: false }),
        hackathon != null
            ? getViewerAnnouncementLocationKey(hackathon.id, userData.id)
            : Promise.resolve(null),
    ]);

    return (
        <ClientContext
            userData={userData}
            hackathonData={hackathon}
            initialAnnouncements={initialAnnouncements}
            initialLastSeenAt={userData.lastSeenAnnouncementsAt ?? null}
            initialViewerAnnouncementLocationKey={
                initialViewerAnnouncementLocationKey
            }
        >
            <ClientLayoutWrapper>
                <CacheClearer initialData={userData} />
                <MobileTopNav initialData={userData}>
                    <SideBar initialData={userData} className="h-full" />
                </MobileTopNav>
                <main className="md:bg-neutral-925 mt-20 flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-auto overflow-y-auto p-6 md:mt-0 md:overflow-y-auto md:rounded-2xl md:border md:border-neutral-600/30 md:p-10">
                    {children}
                </main>
            </ClientLayoutWrapper>
        </ClientContext>
    );
}
