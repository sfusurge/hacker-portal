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
export default function LeaveTeamForm({ teamId }: { teamId: number | string }) {
    const router = useRouter();
    const leaveTeam = trpc.teams.leaveTeam.useMutation();
    const onLeaveTeam = async () => {
        try {
            const parsedTeamId =
                typeof teamId === 'string' ? parseInt(teamId, 10) : teamId;

            await leaveTeam.mutateAsync({
                teamId: parsedTeamId,
            });
        } catch (error) {
            console.log(error);
        }

        router.push('/team');
    };
    return (
        <DialogContent className="max-w-sm gap-6 sm:max-w-[26rem]">
            <DialogHeader>
                <DialogTitle>Leave team</DialogTitle>
                <DialogDescription>
                    Are you sure you want to leave this team? You can join a new
                    team before the submission deadline.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="grid gap-3 text-base md:grid-cols-2">
                <DialogTrigger asChild className="order-2 w-full md:order-0">
                    <Button
                        variant={'default'}
                        size={'cozy'}
                        hierarchy={'secondary'}
                        type="button"
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
                >
                    Yes, leave team
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
