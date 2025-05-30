'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
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
import { Loader2, X } from 'lucide-react';
import { useHackathon } from '@/hooks/use-hackathon';
import { atom, useAtom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import {
    ScoreItem,
    JudgingFormQuestion,
    FormResponse,
} from '@/components/application_components/types';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
} from '@/components/ui/drawer';

interface JudgingFormProps {
    teamId: number;
    projectTitle?: string;
    hackathonId: number;
    user: any;
    didJudge: boolean;
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

export default function JudgingDrawer({
    teamId,
    projectTitle = 'this project',
    hackathonId,
    user,
    didJudge,
}: JudgingFormProps) {
    const { hackathon, hackathonLoaded } = useHackathon();
    const [judgingData, setJudgingData] = useAtom(judgingDataAtom);
    const [formErrors, setFormErrors] = useAtom(formErrorsAtom);
    const [questions, setQuestions] = useAtom(questionsAtom);
    const [formState, setFormState] = useAtom(formStateAtom);

    const [isFormValid, setIsFormValid] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [isRubricOpen, setIsRubricOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    const [isEvaluationDrawerOpen, setIsEvaluationDrawerOpen] = useState(false);
    const [isConfirmationDrawerOpen, setIsConfirmationDrawerOpen] =
        useState(false);

    const [isGlobalRubricOpen, setIsGlobalRubricOpen] = useState(false);

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

    const handleDrawerOpen = useCallback(() => {
        setIsEvaluationDrawerOpen(true);
        validateForm();
    }, [validateForm]);

    const handleRubricOpen = useCallback(() => {
        setIsRubricOpen(true);
    }, []);

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
            setFormState((prevFormState: FormResponse) => {
                const updatedFormState = {
                    ...prevFormState,
                    [questionId]: value,
                };

                setTimeout(() => {
                    setJudgingData((prevJudgingData) => ({
                        ...prevJudgingData,
                        responses: {
                            ...prevJudgingData.responses,
                            [teamId]: updatedFormState,
                        },
                    }));
                }, 0);

                return updatedFormState;
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
            setIsConfirmationDrawerOpen(false);
            setIsEvaluationDrawerOpen(false);
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
                                    formState[section.questionId.toString()] ||
                                    ''
                                }
                                onChange={(value) => {
                                    updateFormState(
                                        section.questionId.toString(),
                                        value
                                    );
                                }}
                                required={section.required}
                                key={`${section.questionId}-${formState[section.questionId.toString()] || 'empty'}`}
                            />
                        </div>
                    );
                case 'text-area':
                    return (
                        <div key={section.questionId}>
                            <TextAreaSection
                                didJudge={didJudge}
                                description={section.description}
                                title={section.title}
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
                                required={section.required}
                                placeholder={section.placeholder}
                            />
                        </div>
                    );
                default:
                    return null;
            }
        },
        [formState, formErrors, handleScoreChange, updateFormState, didJudge]
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
                    setIsConfirmationDrawerOpen(true);
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

        setIsConfirmationDrawerOpen(false);
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

    const handleConfirmationCancel = useCallback(() => {
        setIsConfirmationDrawerOpen(false);
    }, [isEvaluationDrawerOpen]);

    const handleEvaluationDrawerClose = useCallback((open: boolean) => {
        setIsEvaluationDrawerOpen(open);
    }, []);

    useEffect(() => {
        if (!isInitialized && user?.email) {
            try {
                const savedData = localStorage.getItem(JUDGING_DATA_KEY);
                const initialData = savedData
                    ? JSON.parse(savedData)
                    : {
                          hackathonId: 0,
                          email: '',
                          responses: {},
                      };

                setJudgingData({
                    ...initialData,
                    email: user.email,
                    hackathonId,
                });

                const dontShowDialogPreference =
                    localStorage.getItem(DONT_SHOW_DIALOG_KEY);
                if (dontShowDialogPreference === 'true') {
                    setDontShowAgain(true);
                }
            } catch (error) {
                console.error('Error loading saved data:', error);
                setJudgingData({
                    hackathonId,
                    email: user.email,
                    responses: {},
                });
            }

            setIsInitialized(true);
        }
    }, [user?.email, hackathonId, setJudgingData, isInitialized]);

    useEffect(() => {
        if (hackathonLoaded && hackathon && isInitialized) {
            try {
                const judgeQuestions = hackathon.judgeQuestions || [];
                setQuestions(
                    judgeQuestions as unknown as JudgingFormQuestion[]
                );

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
                        } else {
                            initialState[section.questionId.toString()] = null;
                        }
                    });
                    setFormState(initialState);
                }
            } catch (error) {
                console.error('Error initializing form state:', error);
                setFormState({});
            }

            setIsLoading(false);
        }
    }, [
        hackathonLoaded,
        hackathon,
        isInitialized,
        judgingData.responses,
        teamId,
        setQuestions,
        setFormState,
    ]);

    useEffect(() => {
        if (didJudge !== undefined) {
            updateStatusInLocalStorage(didJudge ? 'completed' : 'in_progress');
        }
    }, [didJudge, updateStatusInLocalStorage]);

    useEffect(() => {
        if (
            !isLoading &&
            questions.length > 0 &&
            Object.keys(formState).length > 0
        ) {
            debouncedValidateForm();
        }
    }, [
        formState,
        questions,
        isLoading,
        debouncedValidateForm,
        isEvaluationDrawerOpen,
        isConfirmationDrawerOpen,
    ]);

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

    // Determine if the footer is visible idk man
    const shouldShowMobileFooter =
        !isEvaluationDrawerOpen &&
        !isConfirmationDrawerOpen &&
        !isGlobalRubricOpen;

    return (
        <>
            {isLoading || questions.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center">
                    <Loader2 className="text-brand-400 h-8 w-8 animate-spin" />
                </div>
            ) : (
                <>
                    {shouldShowMobileFooter && (
                        <div className="fixed right-0 bottom-0 left-0 z-[105] border-t border-neutral-600/60 bg-neutral-800/80 px-6 py-4 backdrop-blur-lg md:hidden">
                            <div className="mx-auto flex w-full max-w-md flex-col items-center justify-between gap-4">
                                <div className="grid w-full grid-cols-2 gap-4">
                                    <Button
                                        type="button"
                                        variant="default"
                                        hierarchy="primary"
                                        size="cozy"
                                        className="w-full"
                                        onClick={() =>
                                            setIsGlobalRubricOpen(true)
                                        }
                                    >
                                        View rubric
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={didJudge ? 'default' : 'brand'}
                                        hierarchy="primary"
                                        size="cozy"
                                        className="w-full"
                                        onClick={handleDrawerOpen}
                                        disabled={
                                            isEvaluationDrawerOpen &&
                                            (!isFormValid || isSubmitting)
                                        }
                                    >
                                        {isEvaluationDrawerOpen
                                            ? 'Submit Evaluation'
                                            : didJudge
                                              ? 'Review Submission'
                                              : 'View evaluation'}
                                    </Button>
                                </div>
                                {!!didJudge && (
                                    <p className="text-center text-sm text-white/60">
                                        Your evaluation for this project has
                                        been submitted.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {!isEvaluationDrawerOpen && !isConfirmationDrawerOpen && (
                        <div className="mt-6 hidden w-full rounded-lg border border-neutral-600/60 bg-neutral-800/80 px-6 py-4 md:block xl:hidden">
                            <div className="mx-auto flex w-full flex-col items-center justify-between gap-4">
                                <div className="grid w-full grid-cols-2 gap-4">
                                    <Button
                                        type="button"
                                        variant="default"
                                        hierarchy="primary"
                                        size="cozy"
                                        className="w-full"
                                        onClick={() =>
                                            setIsGlobalRubricOpen(true)
                                        }
                                    >
                                        View rubric
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={didJudge ? 'default' : 'brand'}
                                        hierarchy="primary"
                                        size="cozy"
                                        className="w-full"
                                        onClick={handleDrawerOpen}
                                        disabled={
                                            isEvaluationDrawerOpen &&
                                            (!isFormValid || isSubmitting)
                                        }
                                    >
                                        {isEvaluationDrawerOpen
                                            ? 'Submit Evaluation'
                                            : didJudge
                                              ? 'Review Submission'
                                              : 'View evaluation'}
                                    </Button>
                                </div>
                                {!!didJudge && (
                                    <p className="text-center text-sm text-white/60">
                                        Your evaluation for this project has
                                        been submitted.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                    <Drawer
                        open={isEvaluationDrawerOpen}
                        onOpenChange={handleEvaluationDrawerClose}
                    >
                        <DrawerContent
                            overlayZIndex={105}
                            className={`h-[85vh] ${
                                isRubricOpen || isConfirmationDrawerOpen
                                    ? 'blur-sm transition-all duration-200'
                                    : ''
                            }`}
                        >
                            <DrawerHeader>
                                <DrawerTitle>Evaluation Form</DrawerTitle>
                            </DrawerHeader>
                            <div className="flex-1 overflow-y-auto">
                                <form
                                    ref={formRef}
                                    onSubmit={handleSubmitClick}
                                    className="space-y-6 p-6"
                                    noValidate
                                >
                                    {questions.map((section) => (
                                        <div
                                            key={
                                                section.questionId ||
                                                section.title
                                            }
                                            className="space-y-4"
                                        >
                                            {renderFormSection(section)}
                                        </div>
                                    ))}
                                </form>
                            </div>
                            <DrawerFooter className="border-t border-neutral-600/60 bg-neutral-800/60">
                                <div className="grid w-full grid-cols-2 gap-4">
                                    <Button
                                        type="button"
                                        variant="default"
                                        hierarchy="primary"
                                        size="cozy"
                                        className="w-full"
                                        onClick={handleRubricOpen}
                                    >
                                        View rubric
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant={didJudge ? 'default' : 'brand'}
                                        hierarchy="primary"
                                        size="cozy"
                                        disabled={
                                            isSubmitting ||
                                            !isFormValid ||
                                            didJudge
                                        }
                                        className="w-full"
                                        onClick={handleSubmitClick}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit Evaluation'
                                        )}
                                    </Button>
                                </div>
                            </DrawerFooter>

                            <Drawer
                                open={isConfirmationDrawerOpen}
                                onOpenChange={setIsConfirmationDrawerOpen}
                            >
                                <DrawerContent className="" overlayZIndex={106}>
                                    <DrawerHeader>
                                        <DrawerTitle>
                                            Submit your evaluation for{' '}
                                            {projectTitle}?
                                        </DrawerTitle>
                                        <DrawerDescription>
                                            Once you submit your evaluation for
                                            this project, it can&apos;t be
                                            changed or edited.
                                        </DrawerDescription>
                                    </DrawerHeader>
                                    <div className="flex items-center gap-3 p-6">
                                        <input
                                            type="checkbox"
                                            id="dontShowAgain"
                                            className="h-4 w-4 cursor-pointer"
                                            checked={dontShowAgain}
                                            onChange={(e) =>
                                                setDontShowAgain(
                                                    e.target.checked
                                                )
                                            }
                                        />
                                        <label
                                            htmlFor="dontShowAgain"
                                            className="cursor-pointer text-sm text-white/60"
                                        >
                                            Don't show this again
                                        </label>
                                    </div>
                                    <DrawerFooter className="border-t border-neutral-600/60 bg-neutral-800/60">
                                        <div className="flex gap-3">
                                            <Button
                                                variant="default"
                                                size="cozy"
                                                hierarchy="secondary"
                                                className="flex-1"
                                                onClick={
                                                    handleConfirmationCancel
                                                }
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="brand"
                                                hierarchy="primary"
                                                size="cozy"
                                                className="flex-1"
                                                onClick={handleConfirmSubmit}
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    'Submit'
                                                )}
                                            </Button>
                                        </div>
                                    </DrawerFooter>
                                </DrawerContent>
                            </Drawer>

                            <RubricDialog
                                open={isRubricOpen}
                                onOpenChange={setIsRubricOpen}
                                rubric={hackathon?.judgeRubric}
                            />
                        </DrawerContent>
                    </Drawer>

                    <RubricDialog
                        open={isGlobalRubricOpen}
                        onOpenChange={setIsGlobalRubricOpen}
                        rubric={hackathon?.judgeRubric}
                    />
                </>
            )}
        </>
    );
}
