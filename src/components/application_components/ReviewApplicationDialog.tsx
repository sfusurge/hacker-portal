'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Conditional } from '@/lib/Conditional';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    ResponsiveDialog,
    ResponsiveDialogContent,
    ResponsiveDialogHeader,
    ResponsiveDialogTitle,
    ResponsiveDialogFooter,
    ResponsiveDialogDescription,
} from '@/components/ui/responsive-dialog';

export type ReviewApplicationDialogProps = {
    closeDialog: () => void;
    isOpen: boolean;
    onSubmit: () => void | Promise<void>;
    isSubmitting?: boolean;
};

export default function ReviewApplicationDialog({
    closeDialog,
    isOpen,
    onSubmit,
    isSubmitting = false,
}: ReviewApplicationDialogProps) {
    const pfp = '/Stormy-letter.webp';
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSubmitted(false);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (isSubmitting) return;
        try {
            await onSubmit();
            setSubmitted(true);
        } catch (error) {
            console.error('Submission error:', error);
            setSubmitted(false);
        }
    };

    const handleClose = () => {
        closeDialog();
    };

    return (
        <ResponsiveDialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open && isSubmitting) {
                    return;
                }
                if (!open) {
                    handleClose();
                }
            }}
        >
            <ResponsiveDialogContent className="p-0 sm:max-w-[27rem]">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <Image
                            src={pfp}
                            alt="Stormy Review Application Icon"
                            width={112}
                            height={112}
                            className="mt-6 rounded-full"
                        />
                        <Conditional showWhen={!submitted}>
                            <ResponsiveDialogHeader className="gap-4 px-6">
                                <ResponsiveDialogTitle className="text-center text-pretty">
                                    Are you sure you want to submit your
                                    application?
                                </ResponsiveDialogTitle>
                                <Alert variant={'info'} className="text-left">
                                    <AlertTitle>
                                        Please read before submitting!
                                    </AlertTitle>
                                    <AlertDescription className="text-white/60">
                                        Once you submit your application, you
                                        won&apos;t be able to make changes.
                                        Withdrawn applications cannot be
                                        resubmitted.
                                    </AlertDescription>
                                </Alert>
                            </ResponsiveDialogHeader>
                        </Conditional>

                        <Conditional showWhen={submitted}>
                            <ResponsiveDialogHeader className="gap-4 p-6 pb-0 text-center">
                                <ResponsiveDialogTitle className="text-center">
                                    Your application has been submitted.
                                </ResponsiveDialogTitle>
                                <ResponsiveDialogDescription className="text-base text-pretty">
                                    Thank you for applying! We&apos;ll review
                                    your application and get back to you soon.
                                </ResponsiveDialogDescription>
                            </ResponsiveDialogHeader>
                        </Conditional>
                    </div>

                    <Conditional showWhen={!submitted}>
                        <ResponsiveDialogFooter className="border-neutral-750 grid w-full border-t p-6">
                            <div className="grid w-full gap-4 md:grid-cols-2">
                                <Button
                                    variant="default"
                                    size="compact"
                                    hierarchy="secondary"
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                >
                                    Review my answers
                                </Button>

                                <Button
                                    variant="brand"
                                    size="compact"
                                    hierarchy="primary"
                                    disabled={isSubmitting}
                                    onClick={handleSubmit}
                                    className={isSubmitting ? 'opacity-50' : ''}
                                >
                                    {isSubmitting
                                        ? 'Submitting...'
                                        : 'Submit application'}
                                </Button>
                            </div>
                        </ResponsiveDialogFooter>
                    </Conditional>

                    <Conditional showWhen={submitted}>
                        <ResponsiveDialogFooter className="border-neutral-750 grid w-full border-t p-6">
                            <div className="flex w-full">
                                <Button
                                    variant="brand"
                                    size="compact"
                                    hierarchy="primary"
                                    className="w-full"
                                    onClick={() =>
                                        (window.location.href =
                                            '/application/submitted')
                                    }
                                >
                                    Confirm submission
                                </Button>
                            </div>
                        </ResponsiveDialogFooter>
                    </Conditional>
                </div>
            </ResponsiveDialogContent>
        </ResponsiveDialog>
    );
}
