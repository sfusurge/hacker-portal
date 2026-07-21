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
import { formatEventLocationLabel } from '@/lib/applicationAcceptStatus';
import { ReviewTableAblySubscriber } from '@/components/admin/review/ReviewTableAblySubscriber';
import type { InputFormPageData } from '@/components/application_components/types';
import {
    getApplicationResponseField,
    getApplicationResponseString,
} from '@/lib/applications/applicationReviewExport';
import { resolveApplicationLocationQuestionId } from '@/lib/applications/buildApplicationReviewTableColumns';

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
    const applicationDataMap = useMemo(() => {
        const map = new Map<number, ApplicationWithTeamInfo>();

        for (const appData of applications) {
            map.set(appData.userId, appData as ApplicationWithTeamInfo);
        }

        return map;
    }, [applications]);

    const applicationQuestionPages = (hackathon?.applicationQuestionPages ??
        []) as InputFormPageData[];

    const data = useMemo(
        () => transformResponse(applications, applicationQuestionPages),
        [applications, applicationQuestionPages]
    );

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
            {hackathon?.id ? (
                <ReviewTableAblySubscriber hackathonId={hackathon.id} />
            ) : null}
            <ReviewApplicationsTable
                data={data}
                applicationQuestionPages={applicationQuestionPages}
                applicationCount={applicationCountData?.applicationCount ?? -1}
                applicationDataMap={applicationDataMap}
                fetchNextPage={async () => {
                    if (applicationData.hasNextPage) {
                        await applicationData.fetchNextPage();
                    }
                }}
                onRowClick={(app) => {
                    const idx = data.findIndex((d) => d.id === app.id);
                    setSelectedIndex(idx === -1 ? null : idx);
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
                applicantIndex={selectedIndex ?? undefined}
                applicantTotal={data.length}
            />
        </div>
    );
}

function transformResponse(
    response: any[],
    applicationQuestionPages: InputFormPageData[]
) {
    return response
        .map((item) => {
            const r = (item.response ?? {}) as Record<string, unknown>;

            const eventLocationRaw = getApplicationResponseField(
                r,
                applicationQuestionPages,
                'location'
            );

            const members = item.members;
            const checkIns = item.checkIns;
            const lastEmailSent = item.lastEmailSent;

            const teamName = item.teamName
                ? `${item.teamName} (${item.teamId})`
                : '';

            const eventLocationKey =
                typeof eventLocationRaw === 'string' ? eventLocationRaw : '';

            return {
                id: Number(item.userId),
                teamName,
                currentStatus: item.currentStatus,
                pendingStatus: item.pendingStatus,
                flagged: Boolean(item.flagged),
                lastEmailSent,
                applicationDate: new Date(item.createdDate),
                members,
                firstName: getApplicationResponseString(
                    r,
                    applicationQuestionPages,
                    'firstName'
                ),
                lastName: getApplicationResponseString(
                    r,
                    applicationQuestionPages,
                    'lastName'
                ),
                email: getApplicationResponseString(
                    r,
                    applicationQuestionPages,
                    'email'
                ),
                eventLocation: formatEventLocationLabel(eventLocationKey),
                eventLocationKey,
                checkIns,
                response: r,
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
