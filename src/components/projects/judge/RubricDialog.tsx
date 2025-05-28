'use client';

import {
    ResponsiveDialog,
    ResponsiveDialogContent,
    ResponsiveDialogHeader,
    ResponsiveDialogTitle,
    ResponsiveDialogDescription,
    ResponsiveDialogFooter,
} from '@/components/ui/responsive-dialog';
import { Label } from '@/components/ui/label/label';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { SubmissionJudgeRubric } from '@/components/application_components/types';
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
        <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
            <ResponsiveDialogContent
                hideCloseIcon
                className="flex h-[80vh] flex-col gap-0 border-none bg-neutral-900 p-0 sm:max-w-300"
            >
                {isLoading || !rubric ? (
                    <div className="flex h-full flex-col items-center justify-center">
                        <Loader2 className="text-brand-400 h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col justify-between border-b border-neutral-700 p-6 md:flex-row">
                            <ResponsiveDialogHeader className="">
                                <ResponsiveDialogDescription className="font-medium">
                                    Judging Rubric
                                </ResponsiveDialogDescription>
                                <ResponsiveDialogTitle className="text-2xl leading-tight font-semibold">
                                    <div className="flex flex-wrap items-center gap-1">
                                        <span className="hidden whitespace-nowrap md:inline-flex">
                                            Criterion{' '}
                                            {currentCriterion?.questionId}:
                                        </span>
                                        <span className="inline-flex whitespace-nowrap md:hidden">
                                            #{currentCriterion?.questionId}.
                                        </span>
                                        <span className="break-words">
                                            {currentCriterion?.title}
                                        </span>
                                    </div>
                                </ResponsiveDialogTitle>
                            </ResponsiveDialogHeader>
                            <div className="flex items-end gap-2.5 sm:flex-row">
                                <Button
                                    hierarchy={'primary'}
                                    size={'cozy'}
                                    variant={'default'}
                                    onClick={handlePrevious}
                                    disabled={currentCriterionIndex === 0}
                                >
                                    <ArrowLeftIcon className="h-6 w-6 text-white" />
                                </Button>
                                <div className="flex w-full flex-col gap-2 pt-4 md:block md:w-auto md:pt-0">
                                    <Label className="mb-0 hidden leading-none">
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
                                        <SelectTrigger className="h-11 min-h-11 w-full bg-neutral-700 md:w-64">
                                            <SelectValue placeholder="Select criterion" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[200] w-full space-y-0.5 bg-neutral-800 text-white md:w-64">
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

                        <div className="flex-1 overflow-y-auto p-8 sm:pr-12">
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
                                                    <div className="border-neutral-750 flex w-12 min-w-12 flex-col items-center justify-center gap-2 border-r p-4 text-center sm:w-45 sm:min-w-45 md:w-20 md:min-w-20">
                                                        <div className="flex items-center justify-center text-xl font-semibold">
                                                            {score}
                                                        </div>
                                                        <div className="hidden font-semibold md:block">
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
                        <ResponsiveDialogFooter className="bg-neutral-800/60 px-8 py-6">
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
                        </ResponsiveDialogFooter>
                    </>
                )}
            </ResponsiveDialogContent>
        </ResponsiveDialog>
    );
}
