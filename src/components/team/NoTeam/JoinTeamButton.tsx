'use client';

import { Button } from '@/components/ui/button';
import { trpc } from '@/trpc/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { UserGroupIcon } from '@heroicons/react/24/solid';
import { ComponentProps } from 'react';
import { InternalServerError } from '@/server/exceptions';
interface JoinTeamButtonProps
    extends Omit<ComponentProps<typeof Button>, 'onClick' | 'onError'> {
    teamDisplayId: string;
    onError?: (error: Error) => void;
    buttonText?: string;
    loadingText?: string;
}

export default function JoinTeamButton({
    teamDisplayId,
    onError,
    disabled,
    ...buttonProps
}: JoinTeamButtonProps) {
    const router = useRouter();
    const [isJoining, setIsJoining] = useState(false);

    const joinTeamMutation = trpc.teams.joinTeam.useMutation({
        onSuccess: (data) => {
            toast({
                title: 'Success!',
                description: `You've successfully joined the team ${data.name}.`,
                variant: 'default',
                icon: <UserGroupIcon />,
            });

            router.push('/team');
            router.refresh();
        },
        onError: (error) => {
            console.log(error);
            toast({
                title: 'Failed to join team',
                description: error.message,
                variant: 'default',
                icon: <UserGroupIcon />,
            });

            // handle other errors TODO
            if (error instanceof InternalServerError) {
                console.log(error);
            }

            setIsJoining(false);
        },
    });

    const handleJoinTeam = async () => {
        setIsJoining(true);
        joinTeamMutation.mutate({ teamDisplayId });
    };

    return (
        <Button
            onClick={handleJoinTeam}
            disabled={isJoining || disabled}
            variant="brand"
            size="cozy"
            hierarchy="primary"
            {...buttonProps}
        >
            {isJoining ? 'Joining...' : 'Join team'}
        </Button>
    );
}
