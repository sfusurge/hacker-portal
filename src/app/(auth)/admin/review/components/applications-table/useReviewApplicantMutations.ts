'use client';

import { useCallback } from 'react';
import type { Row } from '@tanstack/react-table';
import { trpc } from '@/trpc/client';
import type { StatusEnum } from '@/db/schema/applications';
import { isAcceptedStatus } from './statusCells';
import type { Applicant } from './types';

export function useReviewApplicantMutations(hackathonId: number) {
    const utils = trpc.useUtils();

    const batchUpdateApplicationStatus =
        trpc.applications.updateApplicationBatch.useMutation({
            onSuccess: async (updatedEntries) => {
                await utils.applications.getApplications.cancel();

                const userIdToUpdatedEntries = new Map(
                    updatedEntries.map((entry) => [entry.userId, entry])
                );

                utils.applications.getApplications.setInfiniteData(
                    {
                        hackathonId,
                    },
                    (old) => {
                        if (!old) {
                            return {
                                pageParams: [],
                                pages: [],
                            };
                        }

                        return {
                            ...old,
                            pages: old.pages.map((page) => {
                                return {
                                    ...page,
                                    applications: page.applications.map(
                                        (application) => {
                                            if (
                                                !userIdToUpdatedEntries.has(
                                                    application.userId
                                                )
                                            ) {
                                                return application;
                                            }

                                            const updatedEntry =
                                                userIdToUpdatedEntries.get(
                                                    application.userId
                                                )!;

                                            return {
                                                ...application,
                                                currentStatus:
                                                    updatedEntry.currentStatus,
                                                pendingStatus:
                                                    updatedEntry.pendingStatus,
                                                flagged: updatedEntry.flagged,
                                            };
                                        }
                                    ),
                                };
                            }),
                        };
                    }
                );
            },
        });

    const updateApplicantById = useCallback(
        async (
            userId: number,
            {
                pendingStatus,
                status,
                flagged,
            }: {
                status?: StatusEnum;
                pendingStatus?: StatusEnum;
                flagged?: boolean;
            }
        ) => {
            await batchUpdateApplicationStatus.mutateAsync({
                hackathonId,
                userIds: [userId],
                pendingStatus,
                status,
                flagged,
            });
        },
        [batchUpdateApplicationStatus, hackathonId]
    );

    const batchUpdateApplicants = useCallback(
        async (
            rows: Row<Applicant>[],
            {
                pendingStatus,
                status,
                flagged,
            }: {
                status?: StatusEnum;
                pendingStatus?: StatusEnum;
                flagged?: boolean;
            }
        ) => {
            const ids = rows.map((row) => row.original.id);

            if (ids.length === 0) {
                console.debug(
                    `No user ids to update status pendingStatus=${pendingStatus} status=${status} flagged=${flagged}`
                );
                return;
            }

            console.debug(
                `Setting Applications pendingStatus=${pendingStatus}, status=${status}, flagged=${flagged}`
            );

            await batchUpdateApplicationStatus.mutateAsync({
                hackathonId,
                userIds: ids,
                pendingStatus,
                status,
                flagged,
            });
        },
        [batchUpdateApplicationStatus, hackathonId]
    );

    const batchSetPendingStatus = useCallback(
        async (rows: Row<Applicant>[], next: StatusEnum) => {
            if (!isAcceptedStatus(next)) {
                await batchUpdateApplicants(rows, { pendingStatus: next });
                return;
            }

            await batchUpdateApplicants(rows, {
                pendingStatus: 'Accepted - RSVP to Confirm',
            });
        },
        [batchUpdateApplicants]
    );

    return {
        batchUpdateApplicationStatus,
        updateApplicantById,
        batchUpdateApplicants,
        batchSetPendingStatus,
        isPending: batchUpdateApplicationStatus.isPending,
    };
}
