'use client';

import ReviewApplicationsTable from '@/app/(auth)/admin/review/components/ReviewApplicationsTable';
import { useEffect, useMemo, useState } from 'react';
import SideCard from '@/app/(auth)/admin/review/components/SideCard';
import { atom, useSetAtom, useAtomValue } from 'jotai';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { trpc } from '@/trpc/client';
import { ApplicationWithTeamInfo } from '@/server/routers/applicationsRouter';
import { sideCardAtomSJ } from '@/app/(auth)/admin/review/components/ReviewApplicationsTable'; // reuse the same atom

export type Applicant = {
    members: string[] | null;
    id: number;
    teamName: string | null;

    // Basic Information
    firstName: string;
    lastName: string;
    pronouns: string;
    email: string;
    haveHackathonExperience: string;
    howHeardAbout: string[];
    dietaryRestrictions?: string[];
    tShirtSize: string;
    resume?: string[];
    discord: string;
    instagram?: string;
    github?: string;
    linkedin?: string;
    portfolio?: string;
    otherLinks?: string;

    // School Information
    school?: string;
    background: string;
    yearOfStudy?: string;
    major: string;

    // Short Answer Questions
    excitement: string;
    problemOrSkill: string;
    dreamProject: string;

    // Sponsors / Agreements
    shareResume: boolean;
    acceptMLH: boolean;
    acceptSFSS: boolean;
    acceptEmails: boolean;
    authorizeMLH: boolean;
    photoRelease: boolean;
    currentStatus: string;
    pendingStatus: string;
    applicationDate: Date;
    lastEmailSent: string;

    checkIns: {
        eventId: number;
        eventTitle: string;
        checkedIn: boolean;
        checkInTime: Date | null;
    }[];
};

export default function ReviewApplicationsPage() {
    const hackathon = useAtomValue(hackathonAtom);

    const [isSideCardOpen, setIsSideCardOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [refreshFlag, setRefreshFlag] = useState(0);
    const setSideCardAtom = useSetAtom(sideCardAtomSJ);
    const currentApp = useAtomValue(sideCardAtomSJ);

    const applicationData = trpc.applications.getApplications.useInfiniteQuery(
        { hackathonId: hackathon?.id! },
        { getNextPageParam: (last) => last.nextToken }
    );
    const { data: applicationCountData } =
        trpc.applications.getApplicationCount.useQuery(
            { hackathonId: hackathon?.id! },
            { enabled: !!hackathon?.id }
        );

    const applications = useMemo(
        () => applicationData.data?.pages.flatMap((p) => p.applications) ?? [],
        [applicationData.data]
    );
    // console.log('applications', { applications });

    const applicationDataMap = useMemo(() => {
        const map = new Map<number, ApplicationWithTeamInfo>();

        for (const appData of applications) {
            map.set(appData.userId, appData);
        }

        return map;
    }, [applications]);

    const data = useMemo(() => transformResponse(applications), [applications]);

    const refresh = () => setRefreshFlag((f) => f + 1);

    const selected: ApplicationWithTeamInfo | null = (() => {
        if (selectedIndex == null) return null;
        const row = data[selectedIndex];
        if (!row) return null;
        return applicationDataMap.get(row.id) ?? null;
    })();

    const openSideCard = () => setIsSideCardOpen(true);
    const closeSideCard = () => setIsSideCardOpen(false);

    const onNext = () => {
        const currentId = currentApp?.userId;
        let i = selectedIndex ?? -1; // default/fallback
        if (currentId != null) {
            const byId = data.findIndex((d) => d.id === currentId);
            if (byId !== -1) i = byId; // only override if found
        }
        const next = Math.min(i + 1, data.length - 1);
        jumpToIndex(next);
    };

    const onPrev = () => {
        const currentId = currentApp?.userId;
        let i = selectedIndex ?? 0;
        if (currentId != null) {
            const idx = data.findIndex((d) => d.id === currentId);
            if (idx !== -1) i = idx;
        }
        const next = Math.max(i - 1, 0);
        jumpToIndex(next);
    };

    function jumpToIndex(nextIdx: number) {
        if (nextIdx < 0 || nextIdx >= data.length) return;
        setSelectedIndex(nextIdx);
        const sel = data[nextIdx];
        const full = applicationDataMap.get(sel.id);
        if (full) setSideCardAtom(full);
    }

    useEffect(() => {
        if (selected) {
            setSideCardAtom(selected);
        }
    }, [selected, setSideCardAtom]);

    useEffect(() => {
        applicationData.refetch();
    }, [refreshFlag]);

    return (
        <div>
            <ReviewApplicationsTable
                data={data}
                applicationCount={applicationCountData?.applicationCount ?? -1}
                applicationDataMap={applicationDataMap}
                fetchNextPage={async () => {
                    if (applicationData.hasNextPage) {
                        await applicationData.fetchNextPage();
                    }
                }}
                onRowClick={(app, idx) => {
                    setSelectedIndex(idx);
                    const full = applicationDataMap.get(app.id);
                    if (full) setSideCardAtom(full);
                    openSideCard();
                }}
                hackathonId={hackathon!.id}
            />

            <SideCard
                visible={isSideCardOpen}
                onclose={closeSideCard}
                onPrev={onPrev}
                onNext={onNext}
                selected={selected}
                onRefresh={refresh}
            />
        </div>
    );
}

function transformResponse(response: any[]) {
    return response
        .map((item) => {
            const {
                '1': firstName,
                '2': lastName,
                '3': pronouns,
                '4': email,
                '5': haveHackathonExperience,
                '6': howHeardAbout,
                '7': dietaryRestrictions,
                '8': tShirtSize,
                '9': resume,
                '10': discord,
                '11': instagram,
                '12': github,
                '13': linkedin,
                '14': portfolio,
                '15': otherLinks,
                '16': school,
                '17': background,
                '18': yearOfStudy,
                '19': major,
                '20': excitement,
                '21': problemOrSkill,
                '22': dreamProject,
                '23': shareResume,
                '24': acceptMLH,
                '25': acceptSFSS,
                '26': acceptEmails,
                '27': authorizeMLH,
                '28': photoRelease,
            } = item.response as Record<string, any>;

            const members = item.members;
            const checkIns = item.checkIns;
            const lastEmailSent = item.lastEmailSent;

            const teamName = item.teamName
                ? `${item.teamName} (${item.teamId})`
                : '';

            return {
                id: Number(item.userId),
                teamName,
                currentStatus: item.currentStatus,
                pendingStatus: item.pendingStatus,
                lastEmailSent,
                applicationDate: new Date(item.createdDate),
                dietaryRestrictions: Array.isArray(dietaryRestrictions)
                    ? dietaryRestrictions
                    : [dietaryRestrictions],
                howHeardAbout: Array.isArray(howHeardAbout)
                    ? howHeardAbout
                    : [howHeardAbout],
                members,
                firstName,
                lastName,
                pronouns,
                email,
                haveHackathonExperience,
                tShirtSize,
                resume,
                discord,
                instagram,
                github,
                linkedin,
                portfolio,
                otherLinks,
                school,
                background,
                yearOfStudy,
                major,
                excitement,
                problemOrSkill,
                dreamProject,
                shareResume,
                acceptMLH,
                acceptSFSS,
                acceptEmails,
                authorizeMLH,
                photoRelease,
                checkIns,
            };
        })
        .sort((a, b) => {
            const teamA = a.teamName.toLowerCase();
            const teamB = b.teamName.toLowerCase();

            if (teamA && teamB) {
                return teamA.localeCompare(teamB);
            }

            if (a.teamName) {
                return -1;
            }

            if (b.teamName) {
                return 1;
            }

            return 0;
        });
}
