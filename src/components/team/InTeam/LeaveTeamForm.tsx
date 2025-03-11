'use client';
import { useRouter } from 'next/navigation';
import { Button } from '../../ui/button';
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';

export default function LeaveTeamForm() {
    const router = useRouter();
    const onLeaveTeam = () => {
        alert('team was left');

        // insert logic to leave team

        router.push('/team');
    };
    return (
        <DialogContent className="max-w-sm gap-6 sm:max-w-[420px]">
            <DialogHeader>
                <DialogTitle>Leave team</DialogTitle>
                <DialogDescription>
                    Are you sure you want to leave this team? You can join a new
                    team before the submission deadline.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="grid grid-cols-2 gap-3 text-base">
                <DialogTrigger asChild className="w-full">
                    <Button
                        variant={'default'}
                        size={'cozy'}
                        hierarchy={'secondary'}
                        type="button"
                    >
                        Cancel
                    </Button>
                </DialogTrigger>
                <Button
                    type="submit"
                    variant="caution"
                    size="cozy"
                    hierarchy="primary"
                    onClick={onLeaveTeam}
                >
                    Leave team
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
