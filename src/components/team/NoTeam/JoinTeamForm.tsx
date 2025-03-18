'use client';

import InputOtp from '@/app/(auth)/admin/qr/checkin_components/six_digit_input-otp';
import { Button } from '@/components/ui/button';
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';

type JoinTeamFormProps = {
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    isInputComplete: boolean;
    onJoinTeam: () => void;
};

export default function JoinTeamForm({
    input,
    setInput,
    isInputComplete,
    onJoinTeam,
}: JoinTeamFormProps) {
    return (
        <DialogContent className="sm:max-w-sm">
            <DialogHeader>
                <DialogTitle>Join a team</DialogTitle>
                <DialogDescription>
                    Enter the 6-digit code to join your team.
                </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-1 text-white/60">
                <label htmlFor="team-code">Team code *</label>
                <InputOtp
                    input={input}
                    setInput={setInput}
                    onSubmit={isInputComplete ? onJoinTeam : undefined}
                />
            </div>
            <DialogFooter className="grid gap-3 text-base md:grid-cols-2">
                <DialogTrigger asChild className="hidden w-full md:block">
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
                    variant="brand"
                    size="cozy"
                    hierarchy="primary"
                    disabled={!isInputComplete}
                    onClick={onJoinTeam}
                >
                    Join team
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
