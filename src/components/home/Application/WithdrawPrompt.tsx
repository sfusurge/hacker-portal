'use client';

import Image from 'next/image';
import { FormTextInput } from '@/components/ui/input/input';
import { useEffect, useState } from 'react';
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

export type WithdrawPromptProps = {
    userId: number;
    closePrompt: () => void;
    isOpen?: boolean;
};

export default function WithdrawPrompt({
    userId,
    closePrompt,
    isOpen = true,
}: WithdrawPromptProps) {
    const pfp = '/SpendyPFP.png';
    const [notSubmittable, setNotSubmittable] = useState(true);
    const [verifyText, setVerifyText] = useState('');
    const [withdrawn, setWithdrawn] = useState(false);
    const [open, setOpen] = useState(isOpen);

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

    const handleClose = () => {
        setOpen(false);
        closePrompt();
    };

    useEffect(() => {
        if (verifyText === 'I WITHDRAW MY APPLICATION') {
            setNotSubmittable(false);
        } else {
            setNotSubmittable(true);
        }
    }, [verifyText]);

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

                    <Conditional showWhen={!withdrawn}>
                        <DialogHeader className="text-center">
                            <DialogTitle className="text-2xl font-bold">
                                Are you sure you want to withdraw your
                                application?
                            </DialogTitle>
                            <DialogDescription>
                                This action is permanent and cannot be undone.
                                To confirm, enter{' '}
                                <span className="text-white">
                                    I WITHDRAW MY APPLICATION
                                </span>{' '}
                                below.
                            </DialogDescription>
                        </DialogHeader>

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
                    </Conditional>

                    <Conditional showWhen={withdrawn}>
                        <DialogHeader className="text-center text-2xl">
                            <DialogTitle className="leading-tighter font-bold">
                                Your application has been withdrawn.
                            </DialogTitle>
                            <DialogDescription>
                                We hope to see you at future events hosted by
                                SFU Surge! 🫶
                            </DialogDescription>
                        </DialogHeader>
                    </Conditional>

                    <Conditional showWhen={!withdrawn}>
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
                                disabled={notSubmittable}
                                onClick={handleWithdraw}
                                className={notSubmittable ? 'opacity-50' : ''}
                            >
                                Withdraw
                            </Button>
                        </DialogFooter>
                    </Conditional>

                    <Conditional showWhen={withdrawn}>
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
