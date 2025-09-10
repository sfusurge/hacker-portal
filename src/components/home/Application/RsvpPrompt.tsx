'use client';

import Image from 'next/image';
import { FormTextInput } from '@/components/ui/input/input';
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
    userId: number;
    closePrompt: () => void;
    isOpen?: boolean;
};

export default function RsvpPrompt({
    userId,
    closePrompt,
    isOpen = true,
}: RsvpPromptProps) {
    const pfp = '/favicon.png';
    const [RSVP, setRSVP] = useState(false);
    const [open, setOpen] = useState(isOpen);

    const hackathon = useAtomValue(hackathonAtom);
    const updateApplication = trpc.applications.updateApplication.useMutation();

    // if (!application ||
    //     application.currentStatus !==
    //     'RSVP'
    // ) {
    //     console.error(
    //         'No valid application found for active hackathon'
    //     );
    //     break;
    // }
    //
    // await trpcClient.applications.updateApplication({
    //     ...application,
    //     status: 'Accepted',
    //     pendingStatus: 'N/A',
    // });
    //
    // // Send confirmation email after successful payment
    // try {
    //     const rsvpTemplate =
    //         await trpcClient.emailTemplates.getEmailTemplateByPurpose(
    //             {
    //                 purpose: 'RSVP Received',
    //             }
    //         );
    //
    //     if (rsvpTemplate) {
    //         // Extract name from application response if possible
    //         const firstName =
    //             application.response['2'] ?? 'Friend';
    //         const lastName = application.response['3'] ?? '';
    //
    //         await trpcClient.emails.sendEmail({
    //             templateId: rsvpTemplate.id,
    //             user: {
    //                 id: application.userId,
    //                 firstName: firstName,
    //                 lastName: lastName,
    //                 email: data.receipt_email,
    //             },
    //         });
    //         console.log(
    //             'RSVP confirmation email sent successfully'
    //         );
    //     } else {
    //         console.error(
    //             'Email template with purpose "RSVP Received" not found'
    //         );
    //     }
    // } catch (emailError) {
    //     console.error(
    //         'Failed to send RSVP confirmation email:',
    //         emailError
    //     );
    // }

    const handleRSVP = useCallback(() => {
        setRSVP(true);
        try {
            updateApplication.mutate({
                hackathonId: hackathon!.id,
                status: 'Accepted',
                pendingStatus: 'N/A',
                userId: userId,
            });
        } catch (error) {
            console.error('Failed to update application:', error);
        }
    }, [hackathon, updateApplication, userId]);

    const handleClose = () => {
        setOpen(false);
        closePrompt();
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
                            <DialogTitle className="text-2xl font-bold">
                                Are you sure you want to RSVP?
                            </DialogTitle>
                            <DialogDescription>
                                This action is permanent and cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                    </Conditional>

                    <Conditional showWhen={RSVP}>
                        <DialogHeader className="text-center text-2xl">
                            <DialogTitle className="leading-tighter font-bold">
                                Your Spot has been reserved!.
                            </DialogTitle>
                            <DialogDescription>
                                We hope to see you at future events hosted by
                                SFU Surge! 🫶
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
