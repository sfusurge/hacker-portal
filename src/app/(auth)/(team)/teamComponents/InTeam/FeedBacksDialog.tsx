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
import { trpc } from '@/trpc/client';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { Loader2 } from 'lucide-react';
import { Suspense, useMemo, useState } from 'react';

function LoadingState() {
    return (
        <div className="flex h-[400px] w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-white/60" />
                <p className="text-sm text-white/60">Loading feedback...</p>
            </div>
        </div>
    );
}

interface Props {
    onClose: () => void;
    open?: boolean;
}

export function FeedbackDialog({ onClose, open }: Props) {
    return (
        <Dialog
            open={open}
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

                <Suspense fallback={<LoadingState />}>
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

    const [selectedIndex, setSelectedIndex] = useState<number | undefined>();

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
                        Feedback from Judge #
                        {selectedIndex !== undefined ? selectedIndex + 1 : 1}
                    </h2>

                    {Object.entries(selectedFeedback.judgeResponse)
                        .filter(
                            ([key, val]) => filteredSchema[key] !== undefined
                        )
                        .map(([key, val]) => {
                            const schema = filteredSchema[key];
                            return (
                                <div key={key}>
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
                                        rows={10}
                                    />
                                </div>
                            );
                        })}
                </div>

                <Button
                    style={{ margin: '0 0 0 auto' }}
                    variant={'default'}
                    hierarchy={'primary'}
                    size="cozy"
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
                {pastSubmissions.map((item, index) => (
                    <FeedbackCard
                        key={index}
                        {...(item as FeedBackProps)}
                        onClick={() => {
                            setSelectedFeedback(item as FeedBackProps);
                            setSelectedIndex(index);
                        }}
                    />
                ))}
            </ScrollArea>
        );
    }
}

interface FeedBackProps {
    judgeQuestionSchema: JudgingFormQuestion[];
    judgeResponse: Record<string, any>;
    hackathonName: string;
    submissionResponse: Record<string, any>;
    judgeId: number;
    hackathonId: number;
}

function FeedbackCard({
    submissionResponse,
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
