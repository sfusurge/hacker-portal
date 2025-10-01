'use client';

import Image from 'next/image';
import { UserData } from '@/server/routers/usersRouter';
import { useCallback, useState, useEffect } from 'react';
import { trpc } from '@/trpc/client';
import { Conditional } from '@/lib/Conditional';
import { Button } from '@/components/ui/button';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { useAtomValue } from 'jotai';
import {
    ResponsiveDialog,
    ResponsiveDialogContent,
    ResponsiveDialogHeader,
    ResponsiveDialogTitle,
    ResponsiveDialogFooter,
    ResponsiveDialogDescription,
} from '@/components/ui/responsive-dialog';
import { CheckBox } from '@/components/ui/checkbox/checkbox';

export type RsvpPromptProps = {
    userData: UserData;
    closePrompt: () => void;
    openWithdrawPrompt: () => void;
    isOpen: boolean;
};

export default function RsvpPrompt({
    userData,
    closePrompt,
    isOpen,
    openWithdrawPrompt,
}: RsvpPromptProps) {
    const pfp = '/stormy-party.webp';
    const [RSVP, setRSVP] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const hackathon = useAtomValue(hackathonAtom);
    const updateApplication = trpc.applications.updateApplication.useMutation();
    const getEmailTemplate =
        trpc.emailTemplates.getEmailTemplateByPurpose.useQuery({
            purpose: 'RSVP Received',
        });
    const sendEmail = trpc.emails.sendEmail.useMutation();
    const updateLastEmailSent =
        trpc.applications.updateLastEmailSent.useMutation();

    const firstName = userData?.firstName || 'Friend';
    const lastName = userData?.lastName || '';
    const userEmail = userData?.email;
    const userId = userData?.id;

    useEffect(() => {
        if (isOpen) {
            setRSVP(false);
            setIsConfirmed(false);
        }
    }, [isOpen]);

    const handleRSVP = useCallback(async () => {
        if (!isConfirmed || !userId || !hackathon) return;

        try {
            setRSVP(true);

            await updateApplication.mutateAsync({
                hackathonId: hackathon.id,
                status: 'Accepted',
                pendingStatus: 'N/A',
                userId: userId,
            });

            if (getEmailTemplate.data?.id && userEmail) {
                await sendEmail.mutateAsync({
                    templateId: getEmailTemplate.data.id,
                    user: {
                        id: userId,
                        firstName,
                        lastName,
                        email: userEmail.trim(),
                    },
                });
                await updateLastEmailSent.mutateAsync({
                    hackathonId: hackathon.id,
                    userId: userId,
                    emailType: 'RSVP Received',
                });
            }
        } catch (error) {
            console.error('Failed to update application:', error);
            setRSVP(false);
        }
    }, [
        hackathon,
        updateApplication,
        sendEmail,
        updateLastEmailSent,
        userId,
        userEmail,
        firstName,
        lastName,
        isConfirmed,
        getEmailTemplate.data?.id,
    ]);

    const handleClose = () => {
        closePrompt();
    };

    const handleWithdrawClick = () => {
        openWithdrawPrompt();
    };

    return (
        <ResponsiveDialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    handleClose();
                }
            }}
        >
            <ResponsiveDialogContent className="p-0 sm:max-w-[28rem]">
                <div className="flex flex-col items-center justify-center gap-6 text-center">
                    <Image
                        src={pfp}
                        alt="Profile Picture"
                        width={100}
                        height={100}
                        className="rounded-full pt-6"
                    />

                    <Conditional showWhen={!RSVP}>
                        <ResponsiveDialogHeader className="gap-4 px-6">
                            <ResponsiveDialogTitle className="text-center text-2xl font-semibold">
                                Confirm your attendance.
                            </ResponsiveDialogTitle>
                            <div className="flex flex-col gap-2 px-2 text-start">
                                <ResponsiveDialogDescription>
                                    Congratulations on your acceptance to{' '}
                                    {hackathon?.hackathonName ||
                                        'StormHacks 2025'}
                                    . Please check the box below to
                                    indicate/confirm your attendance to{' '}
                                    {hackathon?.hackathonName ||
                                        'StormHacks 2025'}
                                    .
                                </ResponsiveDialogDescription>
                                <div>
                                    <ResponsiveDialogDescription>
                                        Day 1: October 4, 2025 (Required)
                                    </ResponsiveDialogDescription>
                                    <ResponsiveDialogDescription>
                                        Day 2: October 5, 2025 (Recommended)
                                    </ResponsiveDialogDescription>
                                </div>
                            </div>
                            <div className="w-full px-2">
                                <CheckBox
                                    name="confirm-attendance"
                                    checked={isConfirmed}
                                    onChange={(e) =>
                                        setIsConfirmed(e.target.checked)
                                    }
                                    label={`I confirm that I will be attending ${hackathon?.hackathonName || 'StormHacks 2025'}.`}
                                />
                            </div>
                        </ResponsiveDialogHeader>
                    </Conditional>

                    <Conditional showWhen={RSVP}>
                        <ResponsiveDialogHeader className="gap-4 text-center text-2xl">
                            <ResponsiveDialogTitle className="leading-tighter font-semibold">
                                Your spot has been reserved!
                            </ResponsiveDialogTitle>
                            <ResponsiveDialogDescription>
                                We&apos;re excited to see you at{' '}
                                {hackathon?.hackathonName || 'StormHacks'}! 🫶
                            </ResponsiveDialogDescription>
                        </ResponsiveDialogHeader>
                    </Conditional>

                    <Conditional showWhen={!RSVP}>
                        <div className="grid w-full grid-cols-2 gap-3 px-6">
                            <Button
                                variant="default"
                                size="cozy"
                                hierarchy="secondary"
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="brand"
                                size="cozy"
                                hierarchy="primary"
                                onClick={handleRSVP}
                                disabled={
                                    !isConfirmed || updateApplication.isPending
                                }
                                className={!isConfirmed ? 'opacity-50' : ''}
                            >
                                {updateApplication.isPending
                                    ? 'Reserving...'
                                    : 'Reserve my spot'}
                            </Button>
                        </div>
                    </Conditional>

                    <Conditional showWhen={!RSVP}>
                        <ResponsiveDialogFooter className="border-neutral-750 flex w-full flex-col items-center justify-center border-t p-5">
                            <ResponsiveDialogDescription className="justify-center text-xs text-white/30">
                                No longer able to make it to the event?
                                <br />
                                <button
                                    className="cursor-pointer text-xs text-white/60 underline hover:text-white/80"
                                    onClick={handleWithdrawClick}
                                >
                                    withdraw your application
                                </button>
                            </ResponsiveDialogDescription>
                        </ResponsiveDialogFooter>
                    </Conditional>

                    <Conditional showWhen={RSVP}>
                        <ResponsiveDialogFooter className="border-neutral-750 flex w-full flex-col-reverse justify-end gap-4 border-t p-5 sm:flex-row">
                            <Button
                                variant="brand"
                                size="cozy"
                                hierarchy="primary"
                                className="w-full"
                                onClick={() => (window.location.href = '/home')}
                            >
                                Return to home
                            </Button>
                        </ResponsiveDialogFooter>
                    </Conditional>
                </div>
            </ResponsiveDialogContent>
        </ResponsiveDialog>
    );
}
