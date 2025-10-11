'use client';

import Image from 'next/image';
import { FormTextInput } from '@/components/ui/input/input';
import { useCallback, useEffect, useState } from 'react';
import { trpc } from '@/trpc/client';
import { Conditional } from '@/lib/Conditional';
import { Button } from '@/components/ui/button';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { useAtomValue } from 'jotai';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import {
    ResponsiveDialog,
    ResponsiveDialogContent,
    ResponsiveDialogHeader,
    ResponsiveDialogTitle,
    ResponsiveDialogFooter,
    ResponsiveDialogDescription,
} from '@/components/ui/responsive-dialog';

export type WithdrawPromptProps = {
    userId: number;
    closePrompt: () => void;
    isOpen: boolean;
};

export default function WithdrawPrompt({
    userId,
    closePrompt,
    isOpen,
}: WithdrawPromptProps) {
    const pfp = '/SpendyPFP.png';
    const [notSubmittable, setNotSubmittable] = useState(true);
    const [verifyText, setVerifyText] = useState('');
    const [withdrawn, setWithdrawn] = useState(false);

    const hackathon = useAtomValue(hackathonAtom);
    const updateApplication = trpc.applications.updateApplication.useMutation();

    useEffect(() => {
        if (isOpen) {
            setNotSubmittable(true);
            setVerifyText('');
            setWithdrawn(false);
        }
    }, [isOpen]);

    const handleWithdraw = useCallback(async () => {
        if (!hackathon || notSubmittable) return;

        try {
            setWithdrawn(true);
            await updateApplication.mutateAsync({
                hackathonId: hackathon.id,
                userId: userId,
                status: 'Withdrawn',
            });
        } catch (error) {
            console.error('Failed to update application:', error);
            setWithdrawn(false);
        }
    }, [hackathon, updateApplication, userId, notSubmittable]);

    const handleClose = () => {
        closePrompt();
        if (withdrawn) {
            window.location.reload();
        }
    };

    useEffect(() => {
        if (verifyText === 'I WITHDRAW MY APPLICATION') {
            setNotSubmittable(false);
        } else {
            setNotSubmittable(true);
        }
    }, [verifyText]);

    return (
        <ResponsiveDialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    handleClose();
                }
            }}
        >
            <ResponsiveDialogContent className="p-0 sm:max-w-[27rem]">
                <div className="flex flex-col items-center justify-center gap-4">
                    <Image
                        src={pfp}
                        alt="Profile Picture"
                        width={100}
                        height={100}
                        className="mt-6 rounded-full"
                    />
                    <Conditional showWhen={!withdrawn}>
                        <ResponsiveDialogHeader className="gap-4 px-6">
                            <ResponsiveDialogTitle className="text-center text-balance">
                                Are you sure you want to withdraw your
                                application?
                            </ResponsiveDialogTitle>
                            <Alert variant={'danger'} className="text-left">
                                <AlertTitle>
                                    Applications cannot be resubmitted once
                                    withdrawn.
                                </AlertTitle>
                                <AlertDescription className="text-white/60">
                                    For any questions regarding your submission,
                                    contact us in the{' '}
                                    <Link
                                        className="underline"
                                        href="https://discord.gg/Rg4mwHvKjd"
                                        target="_blank"
                                    >
                                        #question-and-answer
                                    </Link>{' '}
                                    channel on our Discord server.
                                </AlertDescription>
                            </Alert>

                            <div className="w-full">
                                <ResponsiveDialogDescription className="pb-3 text-base">
                                    To confirm, type{' '}
                                    <span className="text-white">
                                        I WITHDRAW MY APPLICATION
                                    </span>{' '}
                                </ResponsiveDialogDescription>
                                <FormTextInput
                                    name="withdrawText"
                                    type="search"
                                    lazy
                                    style={{
                                        width: '100%',
                                        paddingBottom: '1.25rem',
                                    }}
                                    onLazyChange={(text) => {
                                        setVerifyText(text as string);
                                    }}
                                    required
                                    placeholder="Enter the text to confirm withdrawal"
                                    defaultValue={verifyText}
                                />
                            </div>
                        </ResponsiveDialogHeader>
                    </Conditional>

                    <Conditional showWhen={withdrawn}>
                        <ResponsiveDialogHeader className="gap-4 p-6 text-center">
                            <ResponsiveDialogTitle className="text-center">
                                Your application has been withdrawn.
                            </ResponsiveDialogTitle>
                            <ResponsiveDialogDescription className="text-base text-pretty">
                                We hope to see you at future events hosted by
                                SFU Surge! 🫶
                            </ResponsiveDialogDescription>
                        </ResponsiveDialogHeader>
                    </Conditional>

                    <Conditional showWhen={!withdrawn}>
                        <ResponsiveDialogFooter className="border-neutral-750 grid w-full border-t p-6">
                            <div className="grid w-full grid-cols-2 gap-4">
                                <Button
                                    variant="default"
                                    size="compact"
                                    hierarchy="secondary"
                                    onClick={handleClose}
                                    disabled={updateApplication.isPending}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    variant="brand"
                                    size="compact"
                                    hierarchy="primary"
                                    disabled={
                                        notSubmittable ||
                                        updateApplication.isPending
                                    }
                                    onClick={handleWithdraw}
                                    className={
                                        notSubmittable ||
                                        updateApplication.isPending
                                            ? 'opacity-50'
                                            : ''
                                    }
                                >
                                    {updateApplication.isPending
                                        ? 'Withdrawing...'
                                        : 'Withdraw Application'}
                                </Button>
                            </div>
                        </ResponsiveDialogFooter>
                    </Conditional>

                    <Conditional showWhen={withdrawn}>
                        <ResponsiveDialogFooter className="border-neutral-750 flex w-full flex-col-reverse justify-end gap-4 border-t p-6 sm:flex-row">
                            <div className="flex w-full">
                                <Button
                                    variant="brand"
                                    size="compact"
                                    hierarchy="primary"
                                    className="w-full"
                                    onClick={() =>
                                        (window.location.href = '/home')
                                    }
                                >
                                    Return to home
                                </Button>
                            </div>
                        </ResponsiveDialogFooter>
                    </Conditional>
                </div>
            </ResponsiveDialogContent>
        </ResponsiveDialog>
    );
}
