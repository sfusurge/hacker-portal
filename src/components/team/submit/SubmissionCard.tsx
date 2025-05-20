'use client';

import { useAtom } from 'jotai';
import {
    formDataAtom,
    isSubmittingAtom,
    submitSuccessAtom,
    submitErrorAtom,
    initializeFormData,
} from './SubmissionForm';
import SubmissionForm from './SubmissionForm';
import { useEffect } from 'react';

export default function SubmissionCard({
    questions,
    teamId,
    hackathonId,
}: {
    questions: any[];
    teamId?: number;
    hackathonId?: number;
}) {
    const [formData, setFormData] = useAtom(formDataAtom);
    const [isSubmitting, setIsSubmitting] = useAtom(isSubmittingAtom);
    const [submitSuccess, setSubmitSuccess] = useAtom(submitSuccessAtom);
    const [submitError, setSubmitError] = useAtom(submitErrorAtom);

    //initialize form data when component mounts
    useEffect(() => {
        if (Object.keys(formData).length === 0) {
            setFormData(initializeFormData(questions));
        }
    }, [questions, formData, setFormData]);

    const handleSubmit = async () => {
        if (!teamId || !hackathonId) {
            setSubmitError('Missing team or hackathon information');
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const questionsList = questions[0]?.questions || [];

            const formattedData = questionsList.map((question: any) => ({
                questionId: question.questionId,
                title: question.title,
                type: question.type,
                value: formData[question.questionId],
                description: question.description,
                choices: question.choices,
            }));

            const response = await fetch('/api/submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    teamId,
                    hackathonId,
                    response: { questions: formattedData },
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit form');
            }

            setSubmitSuccess(true);
        } catch (error) {
            setSubmitError(
                error instanceof Error ? error.message : 'An error occurred'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            <SubmissionForm
                questions={questions}
                teamId={teamId || 0}
                hackathonId={hackathonId || 0}
            />
        </div>
    );
}
