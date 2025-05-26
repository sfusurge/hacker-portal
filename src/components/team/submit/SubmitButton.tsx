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
import { SkewmorphicButton } from '@/components/ui/SkewmorphicButton/SkewmorphicButton';
import { cn } from '@/lib/utils';
import style from '@/app/(auth)/application/application_components/ApplicationForm.module.css';

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
        <SkewmorphicButton
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormValid || submitSuccess}
            className={cn(style.nextButton)}
        >
            Submit
        </SkewmorphicButton>
    );
}
