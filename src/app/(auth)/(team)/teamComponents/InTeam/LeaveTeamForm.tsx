'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import { trpc } from '@/trpc/client';
import { useState } from 'react';
import { UserGroupIcon } from '@heroicons/react/24/solid';
import { toast } from '@/hooks/use-toast';

export default function LeaveTeamForm({
    teamId,
    teamName,
}: {
    teamId: number | string;
    teamName: string;
}) {
    const router = useRouter();
    const [isLeaving, setIsLeaving] = useState(false);
    const leaveTeam = trpc.teams.leaveTeam.useMutation();

    const onLeaveTeam = async () => {
        if (isLeaving) return;

        setIsLeaving(true);
        try {
            const parsedTeamId =
                typeof teamId === 'string' ? parseInt(teamId, 10) : teamId;

            await leaveTeam.mutateAsync({
                teamId: parsedTeamId,
            });

            toast({
                title: 'Team left!',
                description: 'You have successfully left the team.',
                variant: 'default',
                icon: <UserGroupIcon />,
            });

            router.push('/team');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to leave the team. Please try again.',
                variant: 'error',
            });
            setIsLeaving(false);
        }
    };

    return (
        <DialogContent borderSeparator className="sm:max-w-[430px]">
            <DialogHeader borderSeparator>
                <DialogTitle>Leave team {teamName}?</DialogTitle>
                <DialogDescription>
                    Are you sure you want to leave this team? You will no longer
                    be in this team anymore.
                    {/* <span className="font-bold text-white/60">
                        {new Date(2025, 8, 25, 23, 59, 59).toLocaleDateString(
                            'en-US',
                            {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                            }
                        )}{' '}
                        - 11:59 PM.
                    </span> */}
                </DialogDescription>
            </DialogHeader>
            <DialogFooter
                borderSeparator
                className="grid gap-3 text-base md:grid-cols-2"
                style={{
                    justifyContent: 'inherit',
                }}
            >
                <DialogTrigger asChild className="w-full">
                    <Button
                        variant={'default'}
                        size={'compact'}
                        desktopSize={'cozy'}
                        hierarchy={'secondary'}
                        type="button"
                        disabled={isLeaving}
                        className="w-full"
                    >
                        No, Cancel
                    </Button>
                </DialogTrigger>
                <Button
                    type="submit"
                    variant="danger"
                    size="compact"
                    desktopSize={'cozy'}
                    hierarchy="primary"
                    onClick={onLeaveTeam}
                    disabled={isLeaving}
                    className="w-full"
                >
                    {isLeaving ? 'Leaving team...' : 'Yes, leave team'}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
