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

export default function SubmissionCard({ questions }: { questions: any[] }) {
    const [formData, setFormData] = useAtom(formDataAtom);

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
