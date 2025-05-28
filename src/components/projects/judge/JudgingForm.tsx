'use client';

import { useState, useEffect, useRef } from 'react';
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
import { useHackathon } from '@/hooks/use-hackathon';
import { atom, useAtom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import {
    ScoreItem,
    ScoreGroupQuestion,
    MultipleChoiceQuestion,
    TextAreaQuestion,
    JudgingFormQuestion,
    FormResponse,
} from '@/components/application_components/types';
interface JudgingFormProps {
    teamId: number;
    projectTitle?: string;
    hackathonId: number;
    user: any;
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
}: JudgingFormProps) {
    const { hackathon, hackathonLoaded } = useHackathon();
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

    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();
    const router = useRouter();

    const { data: didJudge } = trpc.judging.getJudgedProject.useQuery({
        hackathonId,
        teamId,
    });

    const updateStatusInLocalStorage = (
        status: 'in_progress' | 'completed'
    ) => {
        try {
            const statusData = localStorage.getItem(STATUS_KEY);
            const existingStatus = statusData ? JSON.parse(statusData) : {};
            existingStatus[teamId] = status;
            localStorage.setItem(STATUS_KEY, JSON.stringify(existingStatus));
        } catch (error) {
            console.error('Error saving status data:', error);
        }
    };

    const getUserData = () => {
        setJudgingData((prevData) => ({
            ...prevData,
            email: user!.email,
            hackathonId,
        }));
    };

    const updateFormState = (questionId: string, value: string | null) => {
        setFormState((prev: any) => {
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

            setTimeout(() => validateForm(), 100);

            return updated;
        });
    };

    const handleScoreChange = (questionId: string, value: string) => {
        updateFormState(questionId.toString(), value);
    };

    const createJudgeScore = trpc.judging.submitJudgingScore.useMutation({
        onSuccess: () => {
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

    const renderFormSection = (section: JudgingFormQuestion) => {
        switch (section.type) {
            case 'score-group':
                return (
                    <div key={section.title} className="space-y-6">
                        {section.items.map((item: ScoreItem) => (
                            <div key={item.questionId}>
                                <ScoreSection
                                    title={item.title}
                                    category={item.questionId.toString()}
                                    value={
                                        formState[item.questionId.toString()] ||
                                        ''
                                    }
                                    onChange={handleScoreChange}
                                    required={section.required}
                                    hasError={
                                        formErrors[`score_${item.questionId}`]
                                    }
                                />
                            </div>
                        ))}
                    </div>
                );
            case 'multiple-choice':
                return (
                    <div>
                        <CheckboxSection
                            key={section.questionId}
                            title={section.title}
                            description={section.description}
                            options={section.choices.map((choice) => ({
                                id: choice.id,
                                label: choice.name,
                                value: choice.data,
                            }))}
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
                            hasError={
                                formErrors[`choice_${section.questionId}`]
                            }
                        />
                    </div>
                );
            case 'text-area':
                return (
                    <div>
                        <TextAreaSection
                            key={section.questionId}
                            title={section.title}
                            value={
                                formState[section.questionId.toString()] || ''
                            }
                            onChange={(value) =>
                                updateFormState(
                                    section.questionId.toString(),
                                    value
                                )
                            }
                            required={section.required}
                            placeholder={section.placeholder}
                            hasError={
                                formErrors[`textarea_${section.questionId}`]
                            }
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    const validateForm = (): boolean => {
        if (!formRef.current) return false;

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
    };

    const handleSubmitClick = (e: React.FormEvent) => {
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
    };

    const handleConfirmSubmit = async () => {
        if (dontShowAgain) {
            localStorage.setItem(DONT_SHOW_DIALOG_KEY, 'true');
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

            updateStatusInLocalStorage('completed');
            router.push('/projects');
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
    };

    useEffect(() => {
        const dontShowDialogPreference =
            localStorage.getItem(DONT_SHOW_DIALOG_KEY);
        if (dontShowDialogPreference === 'true') {
            setDontShowAgain(true);
        }
    }, []);

    useEffect(() => {
        if (hackathonLoaded && hackathon) {
            const judgeQuestions = hackathon.judgeQuestions || [];
            setQuestions(judgeQuestions as unknown as JudgingFormQuestion[]);

            const savedFormState = judgingData.responses?.[teamId];
            if (!savedFormState) {
                const initialState: FormResponse = {};
                judgeQuestions.forEach((section: any) => {
                    if (section.type === 'score-group') {
                        if (!section.items) return;
                        section.items.forEach((item: any) => {
                            initialState[item.questionId.toString()] = '';
                        });
                    } else {
                        initialState[section.questionId.toString()] = null;
                    }
                });
                setFormState(initialState);
            } else {
                setFormState(savedFormState);
            }
            setIsLoading(false);

            setTimeout(() => validateForm(), 0);
        }
    }, [
        hackathonLoaded,
        hackathon,
        teamId,
        judgingData.responses,
        setFormState,
        setQuestions,
    ]);

    useEffect(() => {
        const savedData = localStorage.getItem(JUDGING_DATA_KEY);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            setJudgingData(parsedData);
            if (parsedData.responses && parsedData.responses[teamId]) {
                setFormState(parsedData.responses[teamId]);

                setTimeout(() => validateForm(), 0);
            }
        }

        getUserData();

        const statusData = localStorage.getItem(STATUS_KEY);
        const existingStatus = statusData ? JSON.parse(statusData) : {};

        if (existingStatus[teamId] !== 'completed') {
            try {
                existingStatus[teamId] = 'in_progress';
                localStorage.setItem(
                    STATUS_KEY,
                    JSON.stringify(existingStatus)
                );
            } catch (error) {
                console.error('Error saving status data:', error);
            }
        }

        setIsLoading(false);
    }, [teamId, user, hackathonId]);

    useEffect(() => {
        if (didJudge) {
            updateStatusInLocalStorage('completed');
        } else {
            updateStatusInLocalStorage('in_progress');
        }
    }, [didJudge]);

    useEffect(() => {
        validateForm();
    }, [formState, questions]);

    return (
        <>
            {isLoading || questions.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center">
                    <Loader2 className="text-brand-400 h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="relative">
                    {didJudge && (
                        <>
                            <div className="absolute inset-0 z-40 bg-neutral-900/70 select-none"></div>

                            <div className="items pointer-events-none sticky top-10 z-50 -mb-40 flex justify-center">
                                <div className="pointer-events-auto flex w-full max-w-md flex-col items-center justify-center gap-1 rounded-xl bg-neutral-800/90 p-6 text-center shadow-lg">
                                    <h2 className="text-2xl font-semibold text-white">
                                        Already Judged
                                    </h2>
                                    <p className="text-white/60">
                                        You have already submitted your
                                        evaluation.
                                    </p>
                                    <Button
                                        variant="brand"
                                        hierarchy="primary"
                                        size="cozy"
                                        className="mt-2"
                                        onClick={() => router.push('/projects')}
                                    >
                                        Return to projects
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}

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

                        <div className="sticky bottom-0 left-0 z-10 -mx-6 bg-neutral-800/60 px-10 py-6 xl:-mx-10">
                            <div className="mx-auto flex w-full max-w-md flex-col items-start justify-between gap-4">
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
