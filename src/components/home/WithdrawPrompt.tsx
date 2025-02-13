'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { FormTextInput } from '@/components/ui/input/input';
import { useEffect, useState } from 'react';
import { SkewmorphicButton } from '@/components/ui/SkewmorphicButton/SkewmorphicButton';
import style from '@/app/(auth)/application/application_components/ApplicationForm.module.css';
import { trpc } from '@/trpc/client';
import { redirect } from 'next/navigation';
import { Conditional } from '@/lib/Conditional';

export type WithdrawPromptProps = {
    userId: number;
    closePrompt: () => void;
};

export default function WithdrawPrompt({
    userId,
    closePrompt,
}: WithdrawPromptProps) {
    const pfp = '/SpendyPFP.png';
    const [notSubmittable, setNotSubmittable] = useState(true);
    const [verifyText, setVerifyText] = useState('');
    const [withdrawn, setWithdrawn] = useState(false);

    const updateApplication =
        trpc.applications.updateApplicationStatus.useMutation();

    const handleWithdraw = () => {
        setWithdrawn(true);
        try {
            updateApplication.mutate({
                hackathonId: 1,
                userId: userId,
                status: 'Withdrawn',
            });
        } catch (error) {
            console.error('Failed to update application:', error);
        }
    };

    useEffect(() => {
        console.log(verifyText);
        if (verifyText === 'I WITHDRAW MY APPLICATION') {
            setNotSubmittable(false);
        } else {
            setNotSubmittable(true);
        }
    }, [verifyText]);

    return (
        <div className="fixed inset-0 flex md:items-center items-end justify-center bg-black bg-opacity-80 z-[150]">
            <div className="relative bg-neutral-900 border border-neutral-750 rounded-xl shadow-lg animate-fadeIn w-96">
                <div className="pt-8 pl-8 pr-8 pb-1">
                    <Conditional showWhen={!withdrawn}>
                        <button
                            className="absolute top-2 right-2 p-1 rounded-full md:hover:bg-neutral-800 transition-colors duration-200"
                            onClick={closePrompt}
                        >
                            <X className="w-5 h-5 text-neutral-400" />
                        </button>
                    </Conditional>
                    <Conditional showWhen={withdrawn}>
                        <a
                            className="absolute top-2 right-2 p-1 rounded-full md:hover:bg-neutral-800 transition-colors duration-200"
                            href={'/home'}
                        >
                            <X className="w-5 h-5 text-neutral-400" />
                        </a>
                    </Conditional>

                    <div className="flex flex-col justify-center items-center text-center gap-5 self-stretch font-sans">
                        <Image
                            src={pfp}
                            alt="Profile Picture"
                            width={100}
                            height={100}
                            className="rounded-full"
                        />

                        <Conditional showWhen={!withdrawn}>
                            <div className="flex flex-col gap-5">
                                <h3 className="justify-center items-center font-bold text-lg">
                                    Are you sure you want to withdraw your
                                    application?
                                </h3>
                                <h3 className="text-white/70">
                                    {
                                        'This action is permanent and cannot be undone. To confirm, enter '
                                    }
                                    <div className="inline text-white">
                                        I WITHDRAW MY APPLICATION
                                    </div>
                                    {' below.'}
                                </h3>
                                <FormTextInput
                                    name="withdrawText"
                                    type="search"
                                    lazy
                                    style={{ width: '100%' }}
                                    onLazyChange={(text) => {
                                        setVerifyText(text as string);
                                    }}
                                    required
                                    placeholder="Enter the text to confirm withdrawal"
                                />
                            </div>
                        </Conditional>

                        <Conditional showWhen={withdrawn}>
                            <div className="flex flex-col gap-5 pb-5">
                                <h3 className="justify-center items-center text-bold">
                                    Your application has been withdrawn.
                                </h3>
                                <h3 className="text-white/70">
                                    We hope to see you at future events hosted
                                    by SFU Surge! 🫶
                                </h3>
                            </div>
                        </Conditional>
                    </div>
                </div>

                <Conditional showWhen={!withdrawn}>
                    <div className="flex flex-row gap-2 justify-between border-t border-neutral-750 w-full pt-4 pb-4 pl-10 pr-10">
                        <button
                            onClick={closePrompt}
                            className="h-9 py-2 px-12 bg-neutral-800/60
                            rounded-lg border border-neutral-600/60
                            justify-center items-center inline-flex overflow-hidden
                            text-white text-sm font-medium"
                        >
                            Cancel
                        </button>

                        <button
                            disabled={notSubmittable}
                            onClick={handleWithdraw}
                            className={`h-9 py-2 px-12 rounded-lg
                            justify-center items-center inline-flex 
                            overflow-hidden text-white text-sm font-medium
                            ${notSubmittable ? 'bg-indigo-900 opacity-50 cursor-not-allowed' : 'bg-indigo-700'}`}
                        >
                            Withdraw
                        </button>
                    </div>
                </Conditional>

                <Conditional showWhen={withdrawn}>
                    <div className="flex flex-row gap-2 justify-center items-center border-t border-neutral-750 w-full pt-4 pb-4 pl-10 pr-10">
                        <a href={'/home'}>
                            <div className="h-9 py-2 bg-indigo-700 rounded-lg shadow-md justify-center items-center inline-flex overflow-hidden">
                                <div className="px-24 justify-center items-center flex">
                                    <div className="text-white text-sm font-medium">
                                        Return to home
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>
                </Conditional>
            </div>
        </div>
    );
}
