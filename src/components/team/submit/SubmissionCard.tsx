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
    return (
        <div className="space-y-4">
            <SubmissionForm questions={questions} />
        </div>
    );
}
