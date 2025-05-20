'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAtom } from 'jotai';
import {
    formDataAtom,
    isSubmittingAtom,
    submitSuccessAtom,
    submitErrorAtom,
} from './SubmissionForm';
import { useState, useEffect } from 'react';
import { trpc } from '@/trpc/client';

export default function SubmitButton({
    teamId,
    hackathonId,
}: {
    teamId?: number;
    hackathonId: number;
}) {
    const [formData] = useAtom(formDataAtom);
    const [isSubmitting, setIsSubmitting] = useAtom(isSubmittingAtom);
    const [submitSuccess, setSubmitSuccess] = useAtom(submitSuccessAtom);
    const [submitError, setSubmitError] = useAtom(submitErrorAtom);
    const [isFormValid, setIsFormValid] = useState(false);

    const submitMutation = trpc.submissions.submitSubmission.useMutation({
        onSuccess: () => {
            setSubmitSuccess(true);
            setIsSubmitting(false);
        },
        onError: (error) => {
            setSubmitError(error.message);
            setIsSubmitting(false);
        },
    });

    useEffect(() => {
        setIsFormValid(Object.keys(formData).length > 0);
    }, [formData]);

    const handleSubmit = async () => {
        if (!teamId || !hackathonId) {
            setSubmitError('Missing team or hackathon information');
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const formattedData = Object.keys(formData).map((questionId) => {
                return {
                    questionId,
                    value: formData[questionId],
                };
            });

            await submitMutation.mutateAsync({
                teamId,
                hackathonId,
                response: { questions: formattedData },
            });
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    return (
        <Card className="p-4">
            <div className="space-y-4">
                <h3 className="font-medium">Ready to submit?</h3>
                {submitError && (
                    <div className="rounded border border-red-400 bg-red-100 p-3 text-sm text-red-700">
                        {submitError}
                    </div>
                )}
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !isFormValid || submitSuccess}
                    className="w-full"
                >
                    {isSubmitting
                        ? 'Submitting...'
                        : submitSuccess
                          ? 'Submitted!'
                          : 'Submit Project'}
                </Button>
                {!teamId && (
                    <p className="text-xs text-amber-600">
                        You need to join or create a team first
                    </p>
                )}
            </div>
        </Card>
    );
}
