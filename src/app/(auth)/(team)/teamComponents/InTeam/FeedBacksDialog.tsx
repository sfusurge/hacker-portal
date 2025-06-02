import {
    JudgingFormQuestion,
    TextAreaQuestion,
} from '@/components/application_components/types';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeaderDescription,
    CardHeaderTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { FormTextArea } from '@/components/ui/formTextArea/FormTextArea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/trpc/client';

import { ArrowLeftIcon } from '@heroicons/react/20/solid';

import { Suspense, useMemo, useState } from 'react';

interface Props {
    onClose: () => void;
}
export function FeebackDialog({ onClose }: Props) {
    return (
        <Dialog
            open
            modal
            onOpenChange={(c) => {
                if (!c) {
                    onClose();
                }
            }}
        >
            <DialogContent
                style={{ width: '700px', maxWidth: 'calc(100dvw - 3rem)' }}
            >
                <DialogHeader>
                    <DialogTitle>Past Project Submission Feedbacks</DialogTitle>
                </DialogHeader>

                <Suspense fallback={<span>Loading...</span>}>
                    <FeedbackDialogContent />
                </Suspense>
            </DialogContent>
        </Dialog>
    );
}

function FeedbackDialogContent() {
    const [pastSubmissions, query] =
        trpc.judging.getUserSubmissionFeedbacks.useSuspenseQuery({});
    const [selectedFeedback, setSelectedFeedback] = useState<
        FeedBackProps | undefined
    >();

    const filteredSchema = useMemo(() => {
        const out: Record<string, TextAreaQuestion> = {};

        if (!selectedFeedback) {
            return out;
        }

        for (const q of selectedFeedback.judgeQuestionSchema) {
            if (q.type === 'text-area') {
                out[q.questionId] = q;
            }
        }
        return out;
    }, [selectedFeedback]);

    if (selectedFeedback) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                }}
            >
                <div>
                    <h2>
                        Feedback from{' '}
                        {`${selectedFeedback.judge.firstName} ${selectedFeedback.judge.lastName}`}
                    </h2>

                    {Object.entries(selectedFeedback.judgeResponse)
                        .filter(
                            ([key, val]) => filteredSchema[key] !== undefined
                        )
                        .map(([key, val]) => {
                            const schema = filteredSchema[key];
                            return (
                                <div>
                                    <Label
                                        style={{
                                            color: 'var(--text-secondary)',
                                        }}
                                    >
                                        {schema.title}
                                    </Label>
                                    <FormTextArea
                                        lazy={false}
                                        defaultValue={val}
                                        readOnly
                                    />
                                </div>
                            );
                        })}
                </div>

                <Button
                    style={{ margin: '0 0 0 auto' }}
                    variant={'default'}
                    hierarchy={'primary'}
                    leadingIconChild={
                        <ArrowLeftIcon style={{ width: '1rem' }} />
                    }
                    onClick={() => {
                        setSelectedFeedback(undefined);
                    }}
                >
                    Back
                </Button>
            </div>
        );
    } else {
        return (
            <ScrollArea>
                {pastSubmissions.length === 0 && (
                    <Label>No Submissions...</Label>
                )}
                {(pastSubmissions as FeedBackProps[]).map((item, index) => (
                    <FeedbackCard
                        key={index}
                        {...item}
                        onClick={() => {
                            setSelectedFeedback(item);
                        }}
                    />
                ))}
            </ScrollArea>
        );
    }
}

interface FeedBackProps {
    judgeResponse: Record<string, any>;
    judgeQuestionSchema: JudgingFormQuestion[];
    hackathonName: string;
    judge: {
        firstName: string;
        lastName: string;
    };
    submissionResponse: Record<string, any>;
}

function FeedbackCard({
    judge,
    judgeResponse,
    submissionResponse,
    judgeQuestionSchema,
    hackathonName,
    onClick,
}: FeedBackProps & { onClick: () => void }) {
    return (
        <Card>
            <CardContent
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <CardHeaderTitle>{submissionResponse['1']}</CardHeaderTitle>
                <CardHeaderDescription>{hackathonName}</CardHeaderDescription>

                <Button
                    style={{ marginLeft: 'auto' }}
                    variant={'default'}
                    hierarchy={'primary'}
                    onClick={onClick}
                >
                    View
                </Button>
            </CardContent>
        </Card>
    );
}
