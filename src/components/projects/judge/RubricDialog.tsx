'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label/label';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { SubmissionJudgeRubric } from '@/app/(auth)/application/application_components/types';
import { Loader2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface RubricDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rubric: SubmissionJudgeRubric[] | undefined;
}

export default function RubricDialog({
    open,
    onOpenChange,
    rubric,
}: RubricDialogProps) {
    const [currentCriterionIndex, setCurrentCriterionIndex] = useState(0);
    const [currentCriterion, setCurrentCriterion] =
        useState<SubmissionJudgeRubric | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (rubric && rubric.length > 0) {
            setCurrentCriterion(rubric[currentCriterionIndex]);
            setIsLoading(false);
        } else {
            setIsLoading(true);
        }
    }, [rubric, currentCriterionIndex]);

    const handlePrevious = () => {
        if (currentCriterionIndex > 0) {
            setCurrentCriterionIndex(currentCriterionIndex - 1);
        }
    };

    const handleNext = () => {
        if (rubric && currentCriterionIndex < rubric.length - 1) {
            setCurrentCriterionIndex(currentCriterionIndex + 1);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="flex h-[75%] flex-col gap-0 border-none bg-neutral-900 p-0 sm:h-[90%] sm:max-w-300"
                hideCloseIcon={true}
            >
                {isLoading || !rubric ? (
                    <div className="flex h-full flex-col items-center justify-center">
                        <Loader2 className="text-brand-400 h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between border-b border-neutral-700 p-6">
                            <DialogHeader>
                                <DialogDescription className="font-medium">
                                    Judging Rubric
                                </DialogDescription>
                                <DialogTitle className="text-2xl font-semibold">
                                    Criterion {currentCriterion?.questionId}:{' '}
                                    {currentCriterion?.title}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col items-end gap-2.5 sm:flex-row">
                                <Button
                                    hierarchy={'primary'}
                                    size={'cozy'}
                                    variant={'default'}
                                    onClick={handlePrevious}
                                    disabled={currentCriterionIndex === 0}
                                >
                                    <ArrowLeftIcon className="h-6 w-6 text-white" />
                                </Button>
                                <div className="flex flex-col gap-2">
                                    <Label className="mb-0 leading-none">
                                        Select criterion
                                    </Label>
                                    <Select
                                        value={currentCriterionIndex.toString()}
                                        onValueChange={(value) =>
                                            setCurrentCriterionIndex(
                                                parseInt(value)
                                            )
                                        }
                                    >
                                        <SelectTrigger className="h-11 min-h-11 w-32 bg-neutral-700 sm:w-64">
                                            <SelectValue placeholder="Select criterion" />
                                        </SelectTrigger>
                                        <SelectContent className="w-32 space-y-0.5 bg-neutral-800 text-white sm:w-64">
                                            {rubric.map((criterion, index) => (
                                                <SelectItem
                                                    key={criterion.questionId}
                                                    value={index.toString()}
                                                    className="pr-4"
                                                >
                                                    <span className="block max-w-[200px] truncate">
                                                        {criterion.title}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    hierarchy={'primary'}
                                    size={'cozy'}
                                    variant={'default'}
                                    onClick={handleNext}
                                    disabled={
                                        currentCriterionIndex ===
                                        rubric.length - 1
                                    }
                                >
                                    <ArrowRightIcon className="h-6 w-6 text-white" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-8 sm:pr-12">
                            {currentCriterion && (
                                <div className="mx-auto w-full space-y-8">
                                    <div className="space-y-4">
                                        <ul className="list-disc space-y-2 pl-6">
                                            {currentCriterion.description.map(
                                                (desc, index) => (
                                                    <li
                                                        key={index}
                                                        className="text-sm"
                                                    >
                                                        {desc}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>

                                    <div className="bg-neutral-750/18 border-neutral-750 border">
                                        {Object.entries(currentCriterion.rubric)
                                            .sort(
                                                (a, b) =>
                                                    Number(b[0]) - Number(a[0])
                                            )
                                            .map(([score, criteria]) => (
                                                <div
                                                    key={score}
                                                    className="border-neutral-750 flex border"
                                                >
                                                    <div className="border-neutral-750 flex w-20 min-w-20 flex-col items-center justify-center gap-2 border-r p-4 text-center sm:w-45 sm:min-w-45">
                                                        <div className="flex items-center justify-center text-xl font-semibold">
                                                            {score}
                                                        </div>
                                                        <div className="font-semibold">
                                                            {score === '5' &&
                                                                'Excellent'}
                                                            {score === '4' &&
                                                                'Very Good'}
                                                            {score === '3' &&
                                                                'Good'}
                                                            {score === '2' &&
                                                                'Fair'}
                                                            {score === '1' &&
                                                                'Poor'}
                                                        </div>
                                                    </div>
                                                    <ul className="list-disc space-y-1 p-5 pl-10">
                                                        {criteria.map(
                                                            (
                                                                criterion,
                                                                index
                                                            ) => (
                                                                <li
                                                                    key={index}
                                                                    className="text-sm"
                                                                >
                                                                    {criterion}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter className="bg-neutral-800/60 px-8 py-6">
                            <div className="flex justify-end">
                                <Button
                                    variant="default"
                                    hierarchy="secondary"
                                    size="cozy"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Return to scoring
                                </Button>
                            </div>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
