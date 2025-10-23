'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/client';
import { useAtomValue } from 'jotai';
import { hackathonAtom, userInfoAtom } from '@/app/(auth)/ClientContext';
import {
    APPLICATION_STATUS_ENUM,
    ApplicationStatus,
    StatusEnum,
} from '@/db/schema/applications';

export default function ApplicationStatusSwitcher() {
    const router = useRouter();
    const hackathon = useAtomValue(hackathonAtom);
    const user = useAtomValue(userInfoAtom);

    const hackathonId = hackathon?.id;
    const userId = user?.id;

    const [currentStatus, setCurrentStatus] = useState<ApplicationStatus | ''>(
        ''
    );
    const [pendingStatus, setPendingStatus] = useState<ApplicationStatus | ''>(
        ''
    );
    const [isUpdating, setIsUpdating] = useState(false);

    const { data: application, refetch } =
        trpc.applications.getCurrentApplication.useQuery(
            { hackathonId: hackathonId },
            { enabled: hackathonId > 0 }
        );

    useEffect(() => {
        try {
            if (application) {
                setCurrentStatus(
                    application.currentStatus as ApplicationStatus
                );
                setPendingStatus(
                    application.pendingStatus as ApplicationStatus
                );
            }
        } catch (e) {
            console.error(
                'ApplicationStatusSwitcher: Failed to set initial statuses',
                e
            );
        }
    }, [application]);

    const updateApplication = trpc.applications.updateApplication.useMutation();

    const canSubmit = useMemo(() => {
        return (
            hackathonId > 0 &&
            userId > 0 &&
            (currentStatus !== '' || pendingStatus !== '')
        );
    }, [hackathonId, userId, currentStatus, pendingStatus]);

    const handleUpdate = async () => {
        if (!canSubmit) return;
        setIsUpdating(true);
        try {
            await updateApplication.mutateAsync({
                hackathonId,
                userId,
                status: (currentStatus || undefined) as StatusEnum | undefined,
                pendingStatus: (pendingStatus || undefined) as
                    | StatusEnum
                    | undefined,
            });
            try {
                await refetch();
            } catch (e) {
                console.error('ApplicationStatusSwitcher: refetch failed', e);
            }
            try {
                router.refresh();
            } catch (e) {
                console.error(
                    'ApplicationStatusSwitcher: router.refresh() failed',
                    e
                );
            }
        } catch (e) {
            console.error(
                'ApplicationStatusSwitcher: Failed to update application status',
                e
            );
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Card className="mt-4 p-3">
            <div className="flex flex-col gap-3">
                <div className="text-sm text-white/90">
                    Change Application Status
                </div>
                <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-2">
                    <label className="text-xs text-white/60">
                        Current Status
                    </label>
                    <select
                        className="rounded bg-neutral-800 px-2 py-1 text-white outline-none"
                        value={currentStatus}
                        onChange={(e) =>
                            setCurrentStatus(
                                e.target.value as ApplicationStatus
                            )
                        }
                    >
                        {APPLICATION_STATUS_ENUM.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2">
                    <Button
                        size={'cozy'}
                        variant="default"
                        hierarchy={'primary'}
                        className="text-sm"
                        onClick={handleUpdate}
                        disabled={isUpdating || !canSubmit}
                    >
                        {isUpdating ? 'Updating...' : 'Update Status'}
                    </Button>
                </div>
            </div>
        </Card>
    );
}
