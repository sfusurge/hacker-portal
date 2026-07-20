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
import type { Dayjs } from 'dayjs';

const dateWithWeekday = (d: Dayjs) => d.format('dddd, MMMM D, YYYY');

/** Plain-text summary for confirmation copy (e.g. success step). */
function formatEventWhenSummary(start: Dayjs, end: Dayjs): string {
    if (start.isSame(end, 'day')) {
        return dateWithWeekday(start);
    }

    const diffDays = end.diff(start, 'day');
    if (diffDays === 1) {
        return `${dateWithWeekday(start)} and ${dateWithWeekday(end)}`;
    }

    return `${start.format('dddd, MMMM D')} – ${end.format('dddd, MMMM D, YYYY')}`;
}

function formatRsvpEventDates(start: Dayjs, end: Dayjs) {
    if (start.isSame(end, 'day')) {
        return (
            <ResponsiveDialogDescription>
                The event is on{' '}
                <span className="font-medium text-white/90">
                    {dateWithWeekday(start)}
                </span>
                . Your attendance is required.
            </ResponsiveDialogDescription>
        );
    }

    const diffDays = end.diff(start, 'day');
    if (diffDays === 1) {
        return (
            <>
                <ResponsiveDialogDescription>
                    Day 1:{' '}
                    <span className="font-medium text-white/90">
                        {dateWithWeekday(start)}
                    </span>{' '}
                    (Required)
                </ResponsiveDialogDescription>
                <ResponsiveDialogDescription>
                    Day 2:{' '}
                    <span className="font-medium text-white/90">
                        {dateWithWeekday(end)}
                    </span>{' '}
                    (Required)
                </ResponsiveDialogDescription>
            </>
        );
    }

    return (
        <>
            <ResponsiveDialogDescription>
                <span className="flex gap-2">
                    <span className="text-white/60 select-none" aria-hidden>
                        •
                    </span>
                    <span>
                        Start:{' '}
                        <span className="font-medium text-white/90">
                            {start.format('dddd, MMMM D, YYYY')}
                        </span>
                    </span>
                </span>
            </ResponsiveDialogDescription>
            <ResponsiveDialogDescription>
                <span className="flex gap-2">
                    <span className="text-white/60 select-none" aria-hidden>
                        •
                    </span>
                    <span>
                        End:{' '}
                        <span className="font-medium text-white/90">
                            {end.format('dddd, MMMM D, YYYY')}
                        </span>
                    </span>
                </span>
            </ResponsiveDialogDescription>
        </>
    );
}

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
    const { data: rsvpTemplate } =
        trpc.emailTemplates.getEmailTemplateByHackathonAndType.useQuery(
            {
                hackathonId: hackathon?.id ?? 0,
                emailType: 'rsvp_received',
            },
            { enabled: !!hackathon?.id }
        );
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

            if (rsvpTemplate?.id && userEmail) {
                const { emailSent } = await sendEmail.mutateAsync({
                    templateId: rsvpTemplate.id,
                    user: {
                        id: userId,
                        firstName,
                        lastName,
                        email: userEmail.trim(),
                    },
                });
                if (emailSent) {
                    await updateLastEmailSent.mutateAsync({
                        hackathonId: hackathon.id,
                        userId: userId,
                        emailType: 'RSVP Received',
                    });
                }
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
        rsvpTemplate?.id,
    ]);

    const handleClose = () => {
        closePrompt();
    };

    const handleWithdrawClick = () => {
        closePrompt();
        openWithdrawPrompt();
    };

    const eventWhenSummary =
        hackathon?.startDate?.isValid() && hackathon?.endDate?.isValid()
            ? formatEventWhenSummary(hackathon.startDate, hackathon.endDate)
            : null;

    const eventName = hackathon?.hackathonName ?? 'the event';

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
                            <ResponsiveDialogTitle className="text-center">
                                Confirm your attendance.
                            </ResponsiveDialogTitle>
                            <div className="flex flex-col gap-2 px-2 text-start">
                                <ResponsiveDialogDescription>
                                    Congratulations on your acceptance to{' '}
                                    {eventName}. Please check the box below to
                                    indicate/confirm your attendance to{' '}
                                    {eventName}.
                                </ResponsiveDialogDescription>
                                <div className="flex flex-col gap-2">
                                    {hackathon?.startDate?.isValid() &&
                                    hackathon?.endDate?.isValid() ? (
                                        formatRsvpEventDates(
                                            hackathon.startDate,
                                            hackathon.endDate
                                        )
                                    ) : (
                                        <ResponsiveDialogDescription>
                                            See the event page for the event
                                            schedule.
                                        </ResponsiveDialogDescription>
                                    )}
                                </div>
                            </div>
                            <div className="w-full px-2">
                                <CheckBox
                                    name="confirm-attendance"
                                    checked={isConfirmed}
                                    onChange={(e) =>
                                        setIsConfirmed(e.target.checked)
                                    }
                                    label={`I confirm that I will be attending ${eventName}.`}
                                />
                            </div>
                        </ResponsiveDialogHeader>
                    </Conditional>

                    <Conditional showWhen={RSVP}>
                        <ResponsiveDialogHeader className="gap-4 text-center">
                            <ResponsiveDialogTitle className="text-center">
                                Your spot has been reserved!
                            </ResponsiveDialogTitle>
                            <ResponsiveDialogDescription>
                                We&apos;re excited to see you at {eventName}
                                {eventWhenSummary ? (
                                    <>
                                        {' '}
                                        on{' '}
                                        <span className="font-medium text-white/90">
                                            {eventWhenSummary}
                                        </span>
                                    </>
                                ) : null}
                                ! 🫶
                            </ResponsiveDialogDescription>
                        </ResponsiveDialogHeader>
                    </Conditional>

                    <Conditional showWhen={!RSVP}>
                        <div className="grid w-full grid-cols-2 gap-3 px-6">
                            <Button
                                variant="default"
                                size="compact"
                                hierarchy="secondary"
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="brand"
                                size="compact"
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
                        <ResponsiveDialogFooter className="border-neutral-750 flex w-full flex-col items-center justify-center border-t p-6">
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
                        <ResponsiveDialogFooter className="border-neutral-750 flex w-full border-t p-6">
                            <Button
                                variant="brand"
                                size="compact"
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
