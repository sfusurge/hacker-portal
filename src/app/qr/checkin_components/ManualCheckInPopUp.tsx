'use client';

import InputOtp from '@/app/qr/checkin_components/six_digit_input-otp';
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
        <div className="flex justify-center items-center overflow-hidden">
            <div className="md:max-w-sm min-w-screen flex-col justify-start items-start inline-flex bg-neutral-900 rounded-tl-xl rounded-xl border-t border-neutral-600/30">
                <div className="flex-col justify-start items-center flex overflow-hidden">
                    <button
                        className="pt-3"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <div className="w-9 h-1.5 relative bg-neutral-750 rounded-full"></div>
                    </button>

                    <div className="self-stretch h-28 p-6 flex-col justify-start items-start gap-2 flex">
                        <div className="self-stretch pr-2 justify-between items-center inline-flex">
                            <div className="text-center text-white text-base font-semibold leading-tight">
                                Manual Check-In
                            </div>
                        </div>

                        <div className="self-stretch text-white/60 text-sm font-normal leading-tight">
                            Enter hacker’s 6-digit code to manually check them
                            into the hackathon.
                        </div>
                    </div>
                </div>

                <div className="self-stretch h-44 px-6 pb-10 bg-neutral-900 flex-col gap-10 flex items-center justify-center">
                    <InputOtp input={input} setInput={setInput} />

                    <button
                        className={`self-stretch min-h-9 px-4 py-2 rounded-lg justify-center items-center inline-flex overflow-hidden transition-colors duration-300 ${isInputComplete ? 'bg-brand-700 drop-shadow-lg' : 'bg-brand-950'}`}
                        onClick={handleClick}
                        disabled={!isInputComplete}
                    >
                        <div className="justify-center items-center flex">
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
