'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
    ScoreSection,
    CheckboxSection,
    TextAreaSection,
} from './JudgingFormSections';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import RubricDialog from './RubricDialog';
import { trpc } from '@/trpc/client';
import { Loader2 } from 'lucide-react';
import { atom, useAtom, useAtomValue } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import {
    ScoreItem,
    JudgingFormQuestion,
    FormResponse,
} from '@/components/application_components/types';
import Link from 'next/link';
import { hackathonAtom } from '@/app/(auth)/ClientContext';

interface JudgingFormProps {
    teamId: number;
    projectTitle?: string;
    hackathonId: number;
    user: any;
    didJudge: boolean;
    isAssignedToJudge?: boolean;
}

const STATUS_KEY = 'judging_status_data';
const JUDGING_DATA_KEY = 'judging_data';
const DONT_SHOW_DIALOG_KEY = 'judging_dont_show_dialog';

const judgingDataAtom = atomWithStorage<{
    hackathonId: number;
    email: string;
    responses: Record<string, FormResponse>;
}>(
    JUDGING_DATA_KEY,
    {
        hackathonId: 0,
        email: '',
        responses: {},
    },
    createJSONStorage(() => localStorage)
);

const formStateAtom = atom<FormResponse>({});
const questionsAtom = atom<JudgingFormQuestion[]>([]);
const formErrorsAtom = atom<Record<string, boolean>>({});

export default function JudgingForm({
    teamId,
    projectTitle = 'this project',
    hackathonId,
    user,
    didJudge,
    isAssignedToJudge = true,
}: JudgingFormProps) {
    const hackathon = useAtomValue(hackathonAtom);
    const [judgingData, setJudgingData] = useAtom(judgingDataAtom);
    const [formErrors, setFormErrors] = useAtom(formErrorsAtom);
    const [questions, setQuestions] = useAtom(questionsAtom);
    const [formState, setFormState] = useAtom(formStateAtom);

    const [isFormValid, setIsFormValid] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [isRubricOpen, setIsRubricOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    const formRef = useRef<HTMLFormElement>(null);
    const validationTimeoutRef = useRef<NodeJS.Timeout>();
    const { toast } = useToast();
    const router = useRouter();

    const validateForm = useCallback((): boolean => {
        if (!formRef.current || questions.length === 0) return false;

        const errors: Record<string, boolean> = {};
        let isValid = true;

        questions.forEach((section: JudgingFormQuestion) => {
            if (section.type === 'score-group' && section.required) {
                if (!section.items) return;
                section.items.forEach((item: ScoreItem) => {
                    const value = formState[item.questionId.toString()];
                    if (!value) {
                        errors[`score_${item.questionId}`] = true;
                        isValid = false;
                    }
                });
            } else if (section.required) {
                const value = formState[section.questionId.toString()];
                if (!value) {
                    errors[`${section.type}_${section.questionId}`] = true;
                    isValid = false;
                }
            }
        });

        setFormErrors(errors);
        setIsFormValid(isValid);
        return isValid;
    }, [formState, questions, setFormErrors]);

    const debouncedValidateForm = useCallback(() => {
        if (validationTimeoutRef.current) {
            clearTimeout(validationTimeoutRef.current);
        }
        validationTimeoutRef.current = setTimeout(() => {
            validateForm();
        }, 100);
    }, [validateForm]);

    const updateStatusInLocalStorage = useCallback(
        (status: 'in_progress' | 'completed') => {
            try {
                const statusData = localStorage.getItem(STATUS_KEY);
                const existingStatus = statusData ? JSON.parse(statusData) : {};
                existingStatus[teamId] = status;
                localStorage.setItem(
                    STATUS_KEY,
                    JSON.stringify(existingStatus)
                );
            } catch (error) {
                console.error('Error saving status data:', error);
            }
        },
        [teamId]
    );

    const updateFormState = useCallback(
        (questionId: string, value: string | null) => {
            setFormState((prev: FormResponse) => {
                const updated = {
                    ...prev,
                    [questionId]: value,
                };

                setJudgingData((prevData) => ({
                    ...prevData,
                    responses: {
                        ...prevData.responses,
                        [teamId]: updated,
                    },
                }));

                return updated;
            });

            debouncedValidateForm();
        },
        [setFormState, setJudgingData, teamId, debouncedValidateForm]
    );

    const handleScoreChange = useCallback(
        (questionId: string, value: string) => {
            updateFormState(questionId.toString(), value);
        },
        [updateFormState]
    );

    const createJudgeScore = trpc.judging.submitJudgingScore.useMutation({
        onSuccess: () => {
            updateStatusInLocalStorage('completed');
            toast({
                title: 'Success!',
                description: `Your evaluation for the project ${projectTitle} has been submitted.`,
                variant: 'success',
            });
            router.push('/projects');
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: `Error submission: ${error.message}`,
                variant: 'default',
                icon: <ExclamationCircleIcon />,
            });
        },
    });

    const renderFormSection = useCallback(
        (section: JudgingFormQuestion) => {
            switch (section.type) {
                case 'score-group':
                    return (
                        <div key={section.title} className="space-y-6">
                            {section.items?.map((item: ScoreItem) => (
                                <div key={item.questionId}>
                                    <ScoreSection
                                        title={item.title}
                                        category={item.questionId.toString()}
                                        value={
                                            formState[
                                                item.questionId.toString()
                                            ] || ''
                                        }
                                        onChange={handleScoreChange}
                                        didJudge={didJudge}
                                        required={section.required}
                                    />
                                </div>
                            ))}
                        </div>
                    );
                case 'multiple-choice':
                    return (
                        <div key={section.questionId}>
                            <CheckboxSection
                                title={section.title}
                                description={section.description}
                                didJudge={didJudge}
                                options={
                                    section.choices?.map((choice) => ({
                                        id: choice.id,
                                        label: choice.name,
                                        value: choice.data,
                                    })) || []
                                }
                                selectedValue={
                                    formState[
                                        section.questionId.toString()
                                    ] as string
                                }
                                onChange={(value) =>
                                    updateFormState(
                                        section.questionId.toString(),
                                        value
                                    )
                                }
                                required={section.required}
                            />
                        </div>
                    );
                case 'text-area':
                    return (
                        <div key={section.questionId}>
                            <TextAreaSection
                                title={section.title}
                                description={section.description}
                                value={
                                    formState[section.questionId.toString()] ||
                                    ''
                                }
                                onChange={(value) =>
                                    updateFormState(
                                        section.questionId.toString(),
                                        value
                                    )
                                }
                                didJudge={didJudge}
                                required={section.required}
                                placeholder={section.placeholder}
                            />
                        </div>
                    );
                default:
                    return null;
            }
        },
        [formState, formErrors, handleScoreChange, updateFormState]
    );

    const handleSubmitClick = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            if (validateForm()) {
                const skipDialog =
                    localStorage.getItem(DONT_SHOW_DIALOG_KEY) === 'true';
                if (skipDialog) {
                    handleConfirmSubmit();
                } else {
                    setIsDialogOpen(true);
                }
            } else {
                toast({
                    title: 'Form Incomplete',
                    description:
                        'Please fill in all required fields before submitting.',
                    variant: 'default',
                    icon: <ExclamationCircleIcon />,
                });
            }
        },
        [validateForm, toast]
    );

    const handleConfirmSubmit = useCallback(async () => {
        if (dontShowAgain) {
            try {
                localStorage.setItem(DONT_SHOW_DIALOG_KEY, 'true');
            } catch (error) {
                console.error('Error saving dialog preference:', error);
            }
        }

        setIsDialogOpen(false);
        setIsSubmitting(true);

        try {
            await createJudgeScore.mutateAsync({
                hackathonId: hackathonId,
                teamId: teamId,
                userId: user.id,
                response: formState,
            });
        } catch (error) {
            console.error('Error submitting evaluation:', error);
            toast({
                title: 'Error',
                description: 'Failed to submit evaluation. Please try again.',
                variant: 'default',
                icon: <ExclamationCircleIcon />,
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [
        dontShowAgain,
        createJudgeScore,
        hackathonId,
        teamId,
        user.id,
        formState,
        toast,
    ]);

    useEffect(() => {
        if (didJudge !== undefined && isAssignedToJudge) {
            updateStatusInLocalStorage(didJudge ? 'completed' : 'in_progress');
        }
    }, [didJudge, updateStatusInLocalStorage, isAssignedToJudge]);

    useEffect(() => {
        if (!isInitialized && user?.email) {
            setJudgingData((prevData) => ({
                ...prevData,
                email: user.email,
                hackathonId,
            }));

            try {
                const dontShowDialogPreference =
                    localStorage.getItem(DONT_SHOW_DIALOG_KEY);
                if (dontShowDialogPreference === 'true') {
                    setDontShowAgain(true);
                }
            } catch (error) {
                console.error('Error loading dialog preference:', error);
            }

            setIsInitialized(true);
        }
    }, [user?.email, hackathonId, setJudgingData, isInitialized]);

    useEffect(() => {
        if (hackathon && isInitialized) {
            const judgeQuestions = hackathon.judgeQuestions || [];
            setQuestions(judgeQuestions as unknown as JudgingFormQuestion[]);

            const savedFormState = judgingData.responses?.[teamId];

            if (savedFormState && Object.keys(savedFormState).length > 0) {
                setFormState(savedFormState);
            } else {
                const initialState: FormResponse = {};
                judgeQuestions.forEach((section: any) => {
                    if (section.type === 'score-group') {
                        section.items?.forEach((item: any) => {
                            initialState[item.questionId.toString()] = '';
                        });
                    } else if (section.type === 'multiple-choice') {
                        initialState[section.questionId.toString()] = '';
                    } else {
                        initialState[section.questionId.toString()] = '';
                    }
                });
                setFormState(initialState);
            }

            setIsLoading(false);
        }
    }, [
        hackathon,
        isInitialized,
        judgingData.responses,
        teamId,
        setQuestions,
        setFormState,
    ]);

    useEffect(() => {
        if (
            !isLoading &&
            questions.length > 0 &&
            Object.keys(formState).length > 0
        ) {
            debouncedValidateForm();
        }
    }, [formState, questions, isLoading, debouncedValidateForm]);

    useEffect(() => {
        return () => {
            if (validationTimeoutRef.current) {
                clearTimeout(validationTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!isRubricOpen && !isLoading) {
            validateForm();
        }
    }, [isRubricOpen, isLoading, validateForm]);

    if (!isAssignedToJudge) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
                <h2 className="text-2xl font-semibold">View Only</h2>
                <Link href="/projects" className="mt-2">
                    <Button hierarchy={'primary'} size="cozy" variant={'brand'}>
                        Go back to projects
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <>
            {isLoading || questions.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center">
                    <Loader2 className="text-brand-400 h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="relative">
                    <form
                        ref={formRef}
                        onSubmit={handleSubmitClick}
                        className="relative flex h-full flex-col gap-8"
                        noValidate
                    >
                        <h2 className="text-2xl font-semibold">
                            Evaluate project
                        </h2>
                        <div className="space-y-6">
                            {questions.map((section) => (
                                <div
                                    key={section.questionId || section.title}
                                    className="space-y-4"
                                >
                                    {renderFormSection(section)}
                                </div>
                            ))}
                        </div>

                        <div className="sticky bottom-0 left-0 z-10 -mx-6 bg-neutral-800/60 px-10 py-6 backdrop-blur-lg xl:-mx-10">
                            <div className="mx-auto flex w-full max-w-md flex-col items-center justify-between gap-4">
                                <div className="grid w-full grid-cols-2 gap-4">
                                    <Button
                                        type="button"
                                        variant="default"
                                        hierarchy="primary"
                                        size="cozy"
                                        className="w-full"
                                        onClick={() => setIsRubricOpen(true)}
                                    >
                                        View rubric
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="brand"
                                        hierarchy="primary"
                                        size="cozy"
                                        disabled={
                                            isSubmitting ||
                                            !isFormValid ||
                                            !!didJudge
                                        }
                                        className="@container w-full"
                                    >
                                        {isSubmitting ? (
                                            'Submitting...'
                                        ) : (
                                            <>
                                                <span className="hidden @[150px]:inline">
                                                    Submit scores
                                                </span>
                                                <span className="inline @[150px]:hidden">
                                                    Submit
                                                </span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                                {!!didJudge && (
                                    <p className="text-center">
                                        Your evaluation for this project has
                                        been submitted.
                                    </p>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="gap-0 p-0">
                    <DialogHeader className="gap-5 rounded-xl bg-neutral-900 p-8 pr-12">
                        <DialogTitle className="leading-normal">
                            Submit your evaluation for {projectTitle}?
                        </DialogTitle>
                        <DialogDescription className="text-base leading-normal text-white">
                            Once you submit your evaluation for this project, it
                            can&apos;t be changed or edited.
                        </DialogDescription>
                        <div className="mt-3 flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="dontShowAgain"
                                className="h-5 w-5 cursor-pointer"
                                checked={dontShowAgain}
                                onChange={(e) =>
                                    setDontShowAgain(e.target.checked)
                                }
                            />
                            <label
                                htmlFor="dontShowAgain"
                                className="cursor-pointer text-sm text-white/60"
                            >
                                Don&apos;t show this again
                            </label>
                        </div>
                    </DialogHeader>
                    <DialogFooter className="flex flex-row justify-end gap-3 border-t border-t-neutral-600/60 bg-neutral-800/60 px-8 py-6">
                        <Button
                            variant="default"
                            size="cozy"
                            hierarchy="secondary"
                            onClick={() => setIsDialogOpen(false)}
                        >
                            No, cancel
                        </Button>
                        <Button
                            variant="brand"
                            hierarchy="primary"
                            size="cozy"
                            className="text-nowrap"
                            onClick={handleConfirmSubmit}
                            disabled={isSubmitting}
                        >
                            Yes, submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <RubricDialog
                open={isRubricOpen}
                onOpenChange={setIsRubricOpen}
                rubric={hackathon?.judgeRubric}
            />
        </>
    );
}
