'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label/label';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
interface RubricDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function RubricDialog({
    open,
    onOpenChange,
}: RubricDialogProps) {
    const [selectedCriterion, setSelectedCriterion] = useState('');
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="flex h-[90%] flex-col gap-0 border-none bg-neutral-900 p-0 sm:max-w-full"
                hideCloseIcon={true}
            >
                <div className="flex items-center justify-between border-b border-neutral-700 p-6">
                    <DialogHeader>
                        <DialogDescription className="font-medium">
                            Judging Rubric
                        </DialogDescription>
                        {/* TODO: Criterion selection */}
                        <DialogTitle className="text-2xl font-semibold">
                            Criterion
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-end gap-2.5">
                        <Button
                            hierarchy={'primary'}
                            size={'cozy'}
                            variant={'default'}
                        >
                            <ArrowLeftIcon className="h-6 w-6 text-white" />
                        </Button>
                        <div className="flex flex-col gap-2">
                            <Label className="mb-0 leading-none">
                                Select criterion
                            </Label>
                            <select className="focus:border-brand-500 focus:ring-brand-500 focus:ring-opacity-50 rounded-md border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-neutral-400">
                                <option value="criterion1">Criterion 1</option>
                                <option value="criterion2">Criterion 2</option>
                                <option value="criterion3">Criterion 3</option>
                            </select>
                        </div>
                        <Button
                            hierarchy={'primary'}
                            size={'cozy'}
                            variant={'default'}
                        >
                            <ArrowRightIcon className="h-6 w-6 text-white" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <div className="mx-auto w-full space-y-8">
                        {/* TODO: Input rubric and map it */}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
