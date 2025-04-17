'use client';

import InputOtp from '@/app/(auth)/admin/qr/checkin_components/six_digit_input-otp';
import { useState } from 'react';

type ManualCheckInProps = {
    onClose: () => void;
    toggleCheckInPrompt: (id: string, displayId: boolean) => void;
};

export default function ManualCheckIn({
    onClose,
    toggleCheckInPrompt,
}: ManualCheckInProps) {
    const [input, setInput] = useState<string>('');

    const isInputComplete = input.length === 6;

    const handleClick = () => {
        toggleCheckInPrompt(input, true);
    };

    return (
        <div className="flex items-center justify-center overflow-hidden">
            <div className="inline-flex max-w-sm flex-col items-start justify-start rounded-xl rounded-tl-xl border-t border-neutral-600/30 bg-neutral-900">
                <div className="flex flex-col items-center justify-start overflow-hidden">
                    <button
                        className="pt-3"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <div className="bg-neutral-750 relative h-1.5 w-9 rounded-full"></div>
                    </button>

                    <div className="flex h-28 flex-col items-start justify-start gap-2 self-stretch p-6">
                        <div className="inline-flex items-center justify-between self-stretch pr-2">
                            <div className="text-center text-base leading-tight font-semibold text-white">
                                Manual Check-In
                            </div>
                        </div>

                        <div className="self-stretch text-sm leading-tight font-normal text-white/60">
                            Enter hacker’s 6-digit code to manually check them
                            into the hackathon.
                        </div>
                    </div>
                </div>

                <div className="flex h-44 flex-col items-center justify-center gap-10 self-stretch bg-neutral-900 px-6 pb-10">
                    <InputOtp input={input} setInput={setInput} />

                    <button
                        className={`inline-flex min-h-9 items-center justify-center self-stretch overflow-hidden rounded-lg px-4 py-2 transition-colors duration-300 ${isInputComplete ? 'bg-brand-700 drop-shadow-lg' : 'bg-brand-950'}`}
                        onClick={handleClick}
                        disabled={!isInputComplete}
                    >
                        <div className="flex items-center justify-center">
                            <div
                                className={`text-base font-medium ${isInputComplete ? 'text-white' : 'text-indigo-800'}`}
                            >
                                Verify Hacker
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
