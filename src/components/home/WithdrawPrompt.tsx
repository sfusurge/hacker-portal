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
        <div className="bg-opacity-80 fixed inset-0 z-150 flex items-end justify-center bg-black md:items-center">
            <div className="border-neutral-750 animate-fadeIn relative w-96 rounded-xl border bg-neutral-900 shadow-lg">
                <div className="pt-8 pr-8 pb-1 pl-8">
                    <Conditional showWhen={!withdrawn}>
                        <button
                            className="absolute top-2 right-2 rounded-full p-1 transition-colors duration-200 md:hover:bg-neutral-800"
                            onClick={closePrompt}
                        >
                            <X className="h-5 w-5 text-neutral-400" />
                        </button>
                    </Conditional>
                    <Conditional showWhen={withdrawn}>
                        <a
                            className="absolute top-2 right-2 rounded-full p-1 transition-colors duration-200 md:hover:bg-neutral-800"
                            href={'/home'}
                        >
                            <X className="h-5 w-5 text-neutral-400" />
                        </a>
                    </Conditional>

                    <div className="flex flex-col items-center justify-center gap-5 self-stretch text-center font-sans">
                        <Image
                            src={pfp}
                            alt="Profile Picture"
                            width={100}
                            height={100}
                            className="rounded-full"
                        />

                        <Conditional showWhen={!withdrawn}>
                            <div className="flex flex-col gap-5">
                                <h3 className="items-center justify-center text-lg font-bold">
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
                                <h3 className="text-bold items-center justify-center">
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
                    <div className="border-neutral-750 flex w-full flex-row justify-between gap-2 border-t pt-4 pr-10 pb-4 pl-10">
                        <button
                            onClick={closePrompt}
                            className="inline-flex h-9 items-center justify-center overflow-hidden rounded-lg border border-neutral-600/60 bg-neutral-800/60 px-12 py-2 text-sm font-medium text-white"
                        >
                            Cancel
                        </button>

                        <button
                            disabled={notSubmittable}
                            onClick={handleWithdraw}
                            className={`inline-flex h-9 items-center justify-center overflow-hidden rounded-lg px-12 py-2 text-sm font-medium text-white ${notSubmittable ? 'cursor-not-allowed bg-indigo-900 opacity-50' : 'bg-indigo-700'}`}
                        >
                            Withdraw
                        </button>
                    </div>
                </Conditional>

                <Conditional showWhen={withdrawn}>
                    <div className="border-neutral-750 flex w-full flex-row items-center justify-center gap-2 border-t pt-4 pr-10 pb-4 pl-10">
                        <a href={'/home'}>
                            <div className="inline-flex h-9 items-center justify-center overflow-hidden rounded-lg bg-indigo-700 py-2 shadow-md">
                                <div className="flex items-center justify-center px-24">
                                    <div className="text-sm font-medium text-white">
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
