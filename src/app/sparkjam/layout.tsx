import { ReactNode } from 'react';
import { HackathonOnlyProvider } from '@/app/(auth)/ClientContext';
import ClientLayoutWrapper from '@/app/(auth)/ClientLayoutWrapper';
import { getCachedActiveHackathon } from '@/server/getCachedActiveHackathon';
import { getUserData } from '@/server/routers/usersRouter';
import { ProjectsRouteProvider } from '@/components/projects/ProjectsRouteContext';
import { SPARKJAM_PROJECTS_PATH } from '@/lib/projects/projectsPaths';
import MobileTopNav from '@/components/sidebar/MobileTopNav';
import SideBar from '@/components/sidebar/SideBar';

export default async function SparkjamProjectsLayout({
    children,
}: {
    children: ReactNode;
}) {
    const [hackathon, userData] = await Promise.all([
        getCachedActiveHackathon(),
        getUserData(),
    ]);

    return (
        <HackathonOnlyProvider hackathonData={hackathon}>
            <ProjectsRouteProvider
                basePath={SPARKJAM_PROJECTS_PATH}
                forceJudgeView
                isPublicView
            >
                <ClientLayoutWrapper>
                    <MobileTopNav initialData={userData}>
                        <SideBar initialData={userData} className="h-full" />
                    </MobileTopNav>
                    <main className="md:bg-neutral-925 mt-20 flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-auto overflow-y-auto p-6 md:mt-0 md:overflow-y-auto md:rounded-2xl md:border md:border-neutral-600/30 md:p-10">
                        {children}
                    </main>
                </ClientLayoutWrapper>
            </ProjectsRouteProvider>
        </HackathonOnlyProvider>
    );
}
