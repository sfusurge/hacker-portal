'use client';

import InputOtp from '@/app/(auth)/admin/qr/checkin_components/six_digit_input-otp';
import { useState } from 'react';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

type ManualCheckInProps = {
    onClose: () => void;
    toggleCheckInPrompt: (id: string) => void;
    show: boolean;
};

export default function ManualCheckIn({
    onClose,
    toggleCheckInPrompt,
    show,
}: ManualCheckInProps) {
    const [input, setInput] = useState<string>('');

    const isInputComplete = input.length === 6;

    const handleClick = () => {
        toggleCheckInPrompt(input);
    };

    return (
        <Drawer open={show} onOpenChange={onClose}>
            <DrawerContent>
                <div className="flex items-center justify-center overflow-hidden">
                    <div className="flex flex-col items-center justify-start overflow-hidden">
                        <DrawerHeader>
                            <DrawerTitle>Manual Check-In</DrawerTitle>
                            <DrawerDescription>
                                Enter hacker's 6-digit code to manually check
                                them into the hackathon.
                            </DrawerDescription>
                        </DrawerHeader>

                        <div className="flex flex-col items-center justify-center gap-10 self-stretch bg-neutral-900 pt-6 pb-10">
                            <InputOtp input={input} setInput={setInput} />

                            <Button
                                variant={'brand'}
                                size="cozy"
                                hierarchy={'primary'}
                                className="w-full"
                                onClick={handleClick}
                                disabled={!isInputComplete}
                            >
                                <div className="flex items-center justify-center">
                                    <div
                                        className={`text-base font-medium ${isInputComplete ? 'text-white' : 'text-indigo-800'}`}
                                    >
                                        Verify hacker
                                    </div>
                                </div>
                            </Button>
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
