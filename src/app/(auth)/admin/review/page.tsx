'use client';

import ReviewApplicationsTable, {
    type Applicant,
    sideCardAtomSJ,
} from '@/app/(auth)/admin/review/components/ReviewApplicationsTable';
import { useEffect, useMemo, useState } from 'react';
import SideCard from '@/app/(auth)/admin/review/components/SideCard';
import { atom, useSetAtom, useAtomValue } from 'jotai';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { trpc } from '@/trpc/client';
import { ApplicationWithTeamInfo } from '@/server/routers/applicationsRouter';

export type { Applicant };

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
    console.log('applications', { applications });

    const applicationDataMap = useMemo(() => {
        const map = new Map<number, ApplicationWithTeamInfo>();

        for (const appData of applications) {
            map.set(appData.userId, appData as ApplicationWithTeamInfo);
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
            const r = item.response as Record<string, any>;

            const {
                '2': eventLocation,
                '5': firstName,
                '6': lastName,
                '7': pronouns,
                '8': email,
                '10': age,
                '16': school,
                '17': schoolEmail,
                '18': background,
                '19': yearOfStudy,
                '20': major,
                '26': haveHackathonExperience,
                '36': howHeardAbout,
                '37': dietaryRestrictions,
                '38': resume,
                '39': discord,
                '40': portfolio,
                '41': github,
                '42': linkedin,
                '43': otherLinks,
                '51': shareResume,
                '53': acceptSFSS,
                '55': photoRelease,
                '57': acceptSurgeEmails,
            } = r;

            const members = item.members;
            const checkIns = item.checkIns;
            const lastEmailSent = item.lastEmailSent;

            const teamName = item.teamName
                ? `${item.teamName} (${item.teamId})`
                : '';

            const majorStr: string = Array.isArray(major)
                ? major.join(', ')
                : typeof major === 'string'
                  ? major
                  : '';

            return {
                id: Number(item.userId),
                teamName,
                currentStatus: item.currentStatus,
                pendingStatus: item.pendingStatus,
                lastEmailSent,
                age: age || '',
                tShirtSize: '',
                applicationDate: new Date(item.createdDate),
                dietaryRestrictions: Array.isArray(dietaryRestrictions)
                    ? dietaryRestrictions
                    : dietaryRestrictions
                      ? [dietaryRestrictions]
                      : [],
                howHeardAbout: Array.isArray(howHeardAbout)
                    ? howHeardAbout
                    : howHeardAbout
                      ? [howHeardAbout]
                      : [],
                members,
                firstName: firstName || '',
                lastName: lastName || '',
                pronouns: pronouns || '',
                email: email || '',
                eventLocation:
                    eventLocation === 'sfu'
                        ? 'Simon Fraser University, Burnaby'
                        : eventLocation === 'waterloo'
                          ? 'University of Waterloo, Waterloo'
                          : typeof eventLocation === 'string'
                            ? eventLocation
                            : '',
                eventLocationKey:
                    typeof eventLocation === 'string' ? eventLocation : '',
                haveHackathonExperience: haveHackathonExperience || '',
                resume: Array.isArray(resume) ? resume : resume ? [resume] : [],
                discord: discord || '',
                github: github || '',
                linkedin: linkedin || '',
                portfolio: portfolio || '',
                otherLinks: otherLinks || '',
                school: school || '',
                schoolEmail: schoolEmail || '',
                background: background || '',
                yearOfStudy: yearOfStudy || '',
                major: majorStr,
                excitement: '',
                problemOrSkill: '',
                dreamProject: '',
                shareResume: shareResume || false,
                acceptMLH: false,
                acceptSFSS: acceptSFSS || false,
                acceptEmails: acceptSurgeEmails || false,
                authorizeMLH: false,
                photoRelease: photoRelease || false,
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
