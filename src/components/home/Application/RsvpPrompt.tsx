'use client';

import Image from 'next/image';
import { UserData } from '@/server/routers/usersRouter';
import { useCallback, useEffect, useState } from 'react';
import { trpc } from '@/trpc/client';
import { Conditional } from '@/lib/Conditional';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { useAtomValue } from 'jotai';
import { createCaller } from '@/server/appRouter';

export type RsvpPromptProps = {
    userData: UserData;
    closePrompt: () => void;
    isOpen?: boolean;
};

export default function RsvpPrompt({
    userData,
    closePrompt,
    isOpen = true,
}: RsvpPromptProps) {
    const pfp = '/favicon.png';
    const [RSVP, setRSVP] = useState(false);
    const [open, setOpen] = useState(isOpen);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const hackathon = useAtomValue(hackathonAtom);
    const updateApplication = trpc.applications.updateApplication.useMutation();
    const getEmailTemplate =
        trpc.emailTemplates.getEmailTemplateByPurpose.useQuery({
            purpose: 'RSVP Received',
        });
    const sendEmail = trpc.emails.sendEmail.useMutation();
    const firstName = userData?.firstName || 'Friend';
    const lastName = userData?.lastName || '';
    const userEmail = userData?.email;
    const userId = userData.id;

    const handleRSVP = useCallback(() => {
        if (!isConfirmed) return;
        setRSVP(true);
        try {
            updateApplication.mutate({
                hackathonId: hackathon!.id,
                status: 'Accepted',
                pendingStatus: 'N/A',
                userId: userId,
            });
            sendEmail.mutate({
                templateId: getEmailTemplate.data.id,
                user: {
                    id: userId,
                    firstName: firstName,
                    lastName: lastName,
                    email: userEmail,
                },
            });
        } catch (error) {
            console.error('Failed to update application:', error);
        }
    }, [hackathon, updateApplication, userId, isConfirmed]);

    const handleClose = () => {
        setOpen(false);
        closePrompt();
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsConfirmed(e.target.checked);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) handleClose();
                else setOpen(isOpen);
            }}
        >
            <DialogContent className="sm:max-w-[25rem]">
                <div className="flex flex-col items-center justify-center gap-5 text-center">
                    <Image
                        src={pfp}
                        alt="Profile Picture"
                        width={100}
                        height={100}
                        className="rounded-full"
                    />

                    <Conditional showWhen={!RSVP}>
                        <DialogHeader className="text-center">
                            <DialogTitle className="text-2xl font-semibold">
                                Confirm your attendance.
                            </DialogTitle>
                            <DialogDescription className="text-start">
                                Congratulations on your acceptance to StormHacks
                                2025. Please check the box below to confirm your
                                attendance for the following dates:
                            </DialogDescription>
                            <DialogDescription className="text-xl font-semibold">
                                October 4 - October 5, 2025
                            </DialogDescription>

                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={isConfirmed}
                                    onChange={handleCheckboxChange}
                                />
                                <span className="text-start text-sm">
                                    I confirm that I will be attending
                                    StormHacks.
                                </span>
                            </label>
                        </DialogHeader>
                    </Conditional>

                    <Conditional showWhen={RSVP}>
                        <DialogHeader className="text-center text-2xl">
                            <DialogTitle className="leading-tighter font-bold">
                                Your spot has been reserved!.
                            </DialogTitle>
                            <DialogDescription>
                                We hope to see you at StormHacks!🫶
                            </DialogDescription>
                        </DialogHeader>
                    </Conditional>

                    <Conditional showWhen={!RSVP}>
                        <DialogFooter className="grid grid-cols-2 justify-between gap-2">
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
                                disabled={!isConfirmed}
                                className={!isConfirmed ? 'opacity-50' : ''}
                            >
                                Reserve my spot
                            </Button>
                        </DialogFooter>
                    </Conditional>

                    <Conditional showWhen={RSVP}>
                        <DialogFooter className="w-full">
                            <Button
                                variant="brand"
                                size="cozy"
                                hierarchy="primary"
                                className="w-full"
                                onClick={() => (window.location.href = '/home')}
                            >
                                Return to home
                            </Button>
                        </DialogFooter>
                    </Conditional>
                </div>
            </DialogContent>
        </Dialog>
    );
}
