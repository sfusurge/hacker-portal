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

export default function LeaveTeamForm({ teamId }: { teamId: number | string }) {
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
            console.log(error);
            toast({
                title: 'Error',
                description: 'Failed to leave the team. Please try again.',
                variant: 'error',
            });
        } finally {
            // setIsLeaving(false);
        }
    };

    return (
        <DialogContent className="max-w-sm gap-6 sm:max-w-[26rem]">
            <DialogHeader>
                <DialogTitle>Leave team</DialogTitle>
                <DialogDescription>
                    Are you sure you want to leave this team? If you choose to
                    leave the team, you can join a new team before the
                    submission deadline.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="grid gap-3 text-base md:grid-cols-2">
                <DialogTrigger asChild className="order-2 w-full md:order-0">
                    <Button
                        variant={'default'}
                        size={'cozy'}
                        hierarchy={'secondary'}
                        type="button"
                        disabled={isLeaving}
                    >
                        No, cancel
                    </Button>
                </DialogTrigger>
                <Button
                    type="submit"
                    variant="caution"
                    size="cozy"
                    hierarchy="primary"
                    onClick={onLeaveTeam}
                    disabled={isLeaving}
                >
                    {isLeaving ? 'Leaving team...' : 'Yes, leave team'}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
