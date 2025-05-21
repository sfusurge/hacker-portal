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
import { createJSONStorage } from 'jotai/utils';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import RubricDialog from './RubricDialog';
import { trpc } from '@/trpc/client';
import { Loader2 } from 'lucide-react';

interface JudgingFormProps {
    projectId: number;
    projectTitle?: string;
    hackathonId: number;
    user: any;
}

const STATUS_KEY = 'judging_status_data';
const JUDGING_DATA_KEY = 'judging_data';

interface FormResponse {
    [key: string]: string | null;
}

type MultipleChoiceOption = {
    id: string;
    data: string;
    name: string;
};

type JudgingQuestion = {
    type: 'multiple-choice' | 'text-area' | 'score-group';
    field: string;
    title: string;
    choices?: MultipleChoiceOption[];
    required: boolean;
    items?: any[];
    questionId: number;
    description?: string;
    placeholder?: string;
};

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

import { atom, useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

const formStateAtom = atomWithStorage<FormResponse>('judging_form_state', {});
const questionsAtom = atom<JudgingQuestion[]>([]);
const formErrorsAtom = atom<Record<string, boolean>>({});

export default function JudgingForm({
    projectId,
    projectTitle = 'this project',
    hackathonId,
    user,
}: JudgingFormProps) {
    const [judgingData, setJudgingData] = useAtom(judgingDataAtom);
    const [formErrors, setFormErrors] = useAtom(formErrorsAtom);
    const [questions, setQuestions] = useAtom(questionsAtom);
    const [formState, setFormState] = useAtom(formStateAtom);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [isRubricOpen, setIsRubricOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const formRef = useRef<HTMLFormElement>(null);
    const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const { toast } = useToast();
    const router = useRouter();
    const { data: questionsData, isLoading: questionsLoading } =
        trpc.judging.getJudgingQuestions.useQuery(
            { hackathonId },
            {
                select: (data) => data as JudgingQuestion[],
            }
        );

    const { data: didJudge, isLoading: judgeCheckLoading } =
        trpc.judging.getJudgedProject.useQuery({
            hackathonId,
            projectId,
        });

    const updateStatusInLocalStorage = (
        status: 'in_progress' | 'completed'
    ) => {
        try {
            const statusData = localStorage.getItem(STATUS_KEY);
            const existingStatus = statusData ? JSON.parse(statusData) : {};
            existingStatus[projectId] = status;
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
        setFormState((prev) => {
            const updated = {
                ...prev,
                [questionId]: value,
            };

            setJudgingData((prevData) => ({
                ...prevData,
                responses: {
                    ...prevData.responses,
                    [projectId]: updated,
                },
            }));

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

    const handleConfirmSubmit = async () => {
        setIsDialogOpen(false);
        setIsSubmitting(true);
        try {
            await createJudgeScore.mutateAsync({
                hackathonId: hackathonId,
                projectId: projectId,
                teamId: projectId,
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

    const renderFormSection = (section: any) => {
        switch (section.type) {
            case 'score-group':
                return (
                    <div key={section.title} className="space-y-6">
                        {section.items.map((item: any) => (
                            <div
                                key={item.questionId}
                                ref={(el: HTMLDivElement | null) => {
                                    sectionRefs.current[
                                        `score_${item.questionId}`
                                    ] = el;
                                }}
                            >
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
                    <div
                        ref={(el: HTMLDivElement | null) => {
                            sectionRefs.current[
                                `choice_${section.questionId}`
                            ] = el;
                        }}
                    >
                        <CheckboxSection
                            key={section.questionId}
                            title={section.title}
                            description={section.description}
                            options={section.choices.map((choice: any) => ({
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
                    <div
                        ref={(el: HTMLDivElement) => {
                            sectionRefs.current[
                                `textarea_${section.questionId}`
                            ] = el;
                        }}
                    >
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

        questions.forEach((section) => {
            if (section.type === 'score-group' && section.required) {
                if (!section.items) return;
                section.items.forEach((item: any) => {
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
        return isValid;
    };

    const scrollToFirstError = () => {
        for (const section of questions) {
            if (section.type === 'score-group') {
                for (const item of section.items || []) {
                    if (formErrors[`score_${item.questionId}`]) {
                        sectionRefs.current[
                            `score_${item.questionId}`
                        ]?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                        });
                        return;
                    }
                }
            } else if (section.type === 'multiple-choice') {
                if (formErrors[`choice_${section.questionId}`]) {
                    sectionRefs.current[
                        `choice_${section.questionId}`
                    ]?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                    return;
                }
            } else if (section.type === 'text-area') {
                if (formErrors[`textarea_${section.questionId}`]) {
                    sectionRefs.current[
                        `textarea_${section.questionId}`
                    ]?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                    return;
                }
            }
        }
    };

    const handleSubmitClick = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            setIsDialogOpen(true);
        } else {
            toast({
                title: 'Form Incomplete',
                description:
                    'Please fill in all required fields before submitting.',
                variant: 'default',
                icon: <ExclamationCircleIcon />,
            });

            setTimeout(scrollToFirstError, 100);
        }
    };

    useEffect(() => {
        if (!questionsLoading && questionsData) {
            setQuestions(questionsData);

            const savedFormState = judgingData.responses?.[projectId];
            if (!savedFormState) {
                const initialState: FormResponse = {};
                questionsData.forEach((section: JudgingQuestion) => {
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
        }
    }, [questionsLoading, questionsData, projectId, judgingData.responses]);

    useEffect(() => {
        const savedData = localStorage.getItem(JUDGING_DATA_KEY);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            setJudgingData(parsedData);
            if (parsedData.responses && parsedData.responses[projectId]) {
                setFormState(parsedData.responses[projectId]);
            }
        }

        getUserData();

        const statusData = localStorage.getItem(STATUS_KEY);
        const existingStatus = statusData ? JSON.parse(statusData) : {};

        if (existingStatus[projectId] !== 'completed') {
            try {
                existingStatus[projectId] = 'in_progress';
                localStorage.setItem(
                    STATUS_KEY,
                    JSON.stringify(existingStatus)
                );
            } catch (error) {
                console.error('Error saving status data:', error);
            }
        }

        setIsLoading(false);
    }, [projectId, user, hackathonId]);

    useEffect(() => {
        if (didJudge) {
            updateStatusInLocalStorage('completed');
        } else {
            updateStatusInLocalStorage('in_progress');
        }
    }, [didJudge]);

    return (
        <>
            {isLoading || questionsLoading || judgeCheckLoading ? (
                <div className="flex h-[calc(100vh-200px)] items-center justify-center">
                    <Loader2 className="text-brand-400 h-8 w-8 animate-spin" />
                </div>
            ) : didJudge ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                    <h2 className="text-2xl font-semibold">Already Judged</h2>
                    <p className="text-pretty text-white/60">
                        You have already submitted your evaluation for this
                        project.
                    </p>
                    <Button
                        variant="brand"
                        hierarchy="primary"
                        size="cozy"
                        onClick={() => router.push('/projects')}
                    >
                        Return to projects
                    </Button>
                </div>
            ) : (
                <form
                    ref={formRef}
                    onSubmit={handleSubmitClick}
                    className="relative -m-10 flex h-max flex-col gap-8 p-10 pb-0"
                    noValidate
                >
                    <h2 className="text-2xl font-semibold">Evaluate project</h2>
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

                    <div className="sticky bottom-0 left-0 z-10 -mx-10 bg-neutral-800/60 px-10 py-6">
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
                                    disabled={isSubmitting}
                                    className="w-full"
                                >
                                    {isSubmitting
                                        ? 'Submitting...'
                                        : 'Submit scores'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
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
                        <div className="mt-3 flex items-center gap-2">
                            <input
                                type="checkbox"
                                className="h-5 w-5 cursor-pointer"
                                checked={dontShowAgain}
                                onChange={(e) =>
                                    setDontShowAgain(e.target.checked)
                                }
                            />
                            {/* TODO: Implement don't show dialog again with localStorage and skip to submission */}
                            <label className="text-sm text-white/60">
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

            <RubricDialog open={isRubricOpen} onOpenChange={setIsRubricOpen} />
        </>
    );
}
