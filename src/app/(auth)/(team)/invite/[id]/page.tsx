'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/client';
import { toast } from '@/hooks/use-toast';
import { use } from 'react';
import { UserGroupIcon } from '@heroicons/react/24/solid';

export default function InvitePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const resolvedParams = use(params);
    const displayId = resolvedParams.id;
    if (!displayId || displayId.length !== 6) {
        return router.push('/team'); // input team id is invalid, redirect to team id input screen.
    }

    const [isLoading, setIsLoading] = useState(false);
    const [hasAttempted, setHasAttempted] = useState(false);

    const joinTeamMutation = trpc.teams.joinTeam.useMutation({
        onSuccess: (data) => {
            toast({
                title: 'Team joined!',
                description: `You successfully joined the team ${data.name}.`,
                variant: 'default',
                icon: <UserGroupIcon />,
            });
            router.push(`/team/${data.teamDisplayId}`);
        },
        onError: (error) => {
            toast({
                title: 'Failed to join team',
                description: error.message,
                variant: 'default',
                icon: <UserGroupIcon />,
            });
            // FIXME: this api could fail for reasons other than team is full.
            router.push(`/team/${displayId}/full`);
        },
        onSettled: () => {
            setIsLoading(false);
        },
    });

    useEffect(() => {
        if (!hasAttempted && !isLoading) {
            setIsLoading(true);
            setHasAttempted(true);
            joinTeamMutation.mutate({ teamDisplayId: displayId });
        }
    }, [hasAttempted, isLoading]);

    return (
        <></>
        // <CurrentStateUI
        //     title="Joining team..."
        //     description="Please wait while we process your request"
        //     imageSrc="/login/application-review.webp"
        // />
    );
}
