'use client';

import { Button } from '@/components/ui/button';
import { trpc } from '@/trpc/client';
import { useRouter } from 'next/navigation';
import { useState, forwardRef } from 'react';
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

const JoinTeamButton = forwardRef<HTMLButtonElement, JoinTeamButtonProps>(
    function JoinTeamButton(
        {
            teamDisplayId,
            onError,
            disabled,
            buttonText = 'Join team',
            loadingText = 'Joining...',
            ...buttonProps
        },
        ref
    ) {
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
                toast({
                    title: 'Failed to join team',
                    description: error.message,
                    variant: 'default',
                    icon: <UserGroupIcon />,
                });

                if (onError) {
                    onError(new Error(error.message));
                }

                if (error instanceof InternalServerError) {
                    console.error('Internal server error:', error);
                }

                setIsJoining(false);
            },
        });

        const handleJoinTeam = () => {
            if (!teamDisplayId || teamDisplayId.trim() === '') {
                if (onError) {
                    onError(
                        new Error('Please enter a valid team code or link')
                    );
                }
                return;
            }

            setIsJoining(true);
            joinTeamMutation.mutate({ teamDisplayId });
        };

        return (
            <Button
                ref={ref}
                onClick={handleJoinTeam}
                disabled={isJoining || disabled || !teamDisplayId}
                variant="brand"
                size="cozy"
                hierarchy="primary"
                type="button"
                {...buttonProps}
            >
                {isJoining ? loadingText : buttonText}
            </Button>
        );
    }
);

export default JoinTeamButton;
