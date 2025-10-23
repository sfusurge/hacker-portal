'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAtomValue } from 'jotai';
import { hackathonAtom, userInfoAtom } from '@/app/(auth)/ClientContext';
import { trpc } from '@/trpc/client';
import { useRouter } from 'next/navigation';

export default function ApplicationSelfDelete() {
    const router = useRouter();
    const hackathon = useAtomValue(hackathonAtom);
    const user = useAtomValue(userInfoAtom);
    const [error, setError] = useState<string | null>(null);

    const { data: application, refetch } =
        trpc.applications.getCurrentApplication.useQuery(
            { hackathonId: hackathon?.id ?? -1 },
            { enabled: (hackathon?.id ?? -1) > 0 }
        );

    const deleteOwn = trpc.applications.deleteOwnApplication.useMutation();

    const handleDelete = async () => {
        if (!hackathon?.id) {
            console.error('No hackathon ID available');
            setError('No hackathon ID available');
            return;
        }

        setError(null);

        try {
            const result = await deleteOwn.mutateAsync({
                hackathonId: hackathon.id,
            });

            if (!result.success) {
                console.warn('Delete failed:', result.message);
                setError(result.message || 'Delete failed');
            }
        } catch (e) {
            console.error(
                'ApplicationSelfDelete: deleteOwnApplication failed',
                e
            );
            setError(
                e instanceof Error ? e.message : 'Failed to delete application'
            );
        }

        try {
            localStorage.removeItem('application_response');
        } catch (e) {
            console.error(
                'ApplicationSelfDelete: Failed clearing localStorage after delete',
                e
            );
        }

        try {
            await refetch();
        } catch (e) {
            console.error(
                'ApplicationSelfDelete: refetch failed (non-fatal)',
                e
            );
        }

        try {
            router.refresh();
        } catch (e) {
            console.error(
                'ApplicationSelfDelete: router.refresh() failed (non-fatal)',
                e
            );
        }
    };

    const hasContext = Boolean(hackathon?.id && user?.id);
    const hasApplication = Boolean(application);
    const canDelete = hasContext && hasApplication;

    return (
        <Card className="mt-4 p-3">
            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1 text-sm">
                    <span className="text-white/90">Delete Application</span>
                    <span className="text-xs text-white/60">
                        {hasApplication
                            ? 'Deletes application for this event and clears saved draft.'
                            : 'No application found for this hackathon.'}
                    </span>
                </div>

                {error && (
                    <div className="rounded bg-red-500/10 p-2 text-xs text-red-500">
                        Error: {error}
                    </div>
                )}

                <Button
                    size={'cozy'}
                    variant="danger"
                    hierarchy={'primary'}
                    className="w-full text-sm sm:w-auto"
                    disabled={!canDelete}
                    onClick={handleDelete}
                >
                    Delete Application
                </Button>
            </div>
        </Card>
    );
}
