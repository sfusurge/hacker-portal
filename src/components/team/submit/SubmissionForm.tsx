'use client';

import React, { useEffect, useRef } from 'react';
import { atom, useAtom } from 'jotai';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CheckBoxGroupInput } from '@/components/application_components/InputFormComponents/CheckboxGroupInput';
import { CheckBoxInput } from '@/components/application_components/InputFormComponents/CheckboxInput';
import { RadioInput } from '@/components/application_components/InputFormComponents/RadioInput';
import { NumberInput } from '@/components/application_components/InputFormComponents/NumberInput';
import { TextAreaInput } from '@/components/application_components/InputFormComponents/TextAreaInput';
import { TextLineInput } from '@/components/application_components/InputFormComponents/TextLineInput';

// Store files separately from other form data
export const formDataAtom = atom<Record<string, any>>({});
export const formFilesAtom = atom<Record<string, File[]>>({});
export const isSubmittingAtom = atom(false);
export const submitSuccessAtom = atom(false);
export const submitErrorAtom = atom<string | null>(null);

export const createQuestionAtom = (question: any) => {
    return atom(
        (get) => {
            const formData = get(formDataAtom);
            return {
                ...question,
                value:
                    formData[question.questionId] ||
                    (question.type === 'multiple-checkbox' ? [] : ''),
            };
        },
        (get, set, newValue: any) => {
            const formData = get(formDataAtom);
            set(formDataAtom, {
                ...formData,
                [newValue.questionId]: newValue.value,
            });
        }
    );
};

export const initializeFormData = (questions: any[]) => {
    const questionsList = questions[0]?.questions || [];
    const initialData: Record<string, any> = {};
    const initialFiles: Record<string, File[]> = {};

    questionsList.forEach((question: any) => {
        if (question.type === 'multiple-checkbox') {
            initialData[question.questionId] = [];
        } else if (question.type === 'checkbox') {
            initialData[question.questionId] = false;
        } else if (question.type === 'file-upload') {
            initialData[question.questionId] = []; // Store file names for display
            initialFiles[question.questionId] = []; // Store actual File objects
        } else {
            initialData[question.questionId] = '';
        }
    });

    return { initialData, initialFiles };
};

export default function SubmissionForm({ questions }: { questions: any[] }) {
    const questionsList = questions[0]?.questions || [];
    const formRef = useRef<HTMLFormElement>(null);

    const [formData, setFormData] = useAtom(formDataAtom);
    const [formFiles, setFormFiles] = useAtom(formFilesAtom);
    const [submitSuccess] = useAtom(submitSuccessAtom);
    const [submitError] = useAtom(submitErrorAtom);

    useEffect(() => {
        if (Object.keys(formData).length === 0) {
            const { initialData, initialFiles } = initializeFormData(questions);
            setFormData(initialData);
            setFormFiles(initialFiles);
        }
    }, [questions, formData, setFormData, setFormFiles]);

    // Create question atoms for each question
    const questionAtoms = React.useMemo(() => {
        return questionsList.map((question: any) =>
            createQuestionAtom(question)
        );
    }, [questionsList]);

    // Enhanced file upload handler that stores both File objects and names
    const handleFileUpload = (questionId: string, files: FileList | null) => {
        if (!files) return;

        const fileArray = Array.from(files);
        const fileNames = fileArray.map((file) => file.name);

        // Store file names in formData for display
        setFormData((prev) => ({
            ...prev,
            [questionId]: fileNames,
        }));

        // Store actual File objects in formFiles for upload
        setFormFiles((prev) => ({
            ...prev,
            [questionId]: fileArray,
        }));
    };

    // Helper function to remove a specific file
    const removeFile = (questionId: string, fileIndex: number) => {
        const currentFiles = formFiles[questionId] || [];
        const currentFileNames = formData[questionId] || [];

        const updatedFiles = currentFiles.filter(
            (_, index) => index !== fileIndex
        );
        const updatedFileNames = currentFileNames.filter(
            (_, index) => index !== fileIndex
        );

        setFormFiles((prev) => ({
            ...prev,
            [questionId]: updatedFiles,
        }));

        setFormData((prev) => ({
            ...prev,
            [questionId]: updatedFileNames,
        }));
    };

    if (submitSuccess) {
        return (
            <Card className="p-6">
                <div className="py-8 text-center">
                    <h2 className="mb-2 text-2xl font-bold text-green-600">
                        Submission Successful!
                    </h2>
                    <p className="text-gray-600">
                        Your submission has been received.
                    </p>
                </div>
            </Card>
        );
    }

    const renderQuestionInput = (question: any, index: number) => {
        const questionAtom = questionAtoms[index];

        switch (question.type) {
            case 'text-line':
                return <TextLineInput dataAtom={questionAtom} />;

            case 'text-area':
                return <TextAreaInput dataAtom={questionAtom} />;

            case 'number':
                return <NumberInput dataAtom={questionAtom} />;

            case 'multiple-choice':
                return <RadioInput dataAtom={questionAtom} />;

            case 'checkbox':
                return <CheckBoxInput dataAtom={questionAtom} />;

            case 'multiple-checkbox':
                return <CheckBoxGroupInput dataAtom={questionAtom} />;

            case 'file-upload':
                return (
                    <div className="space-y-2">
                        <Input
                            id={question.questionId}
                            type="file"
                            multiple={question.allowMultiple}
                            onChange={(e) =>
                                handleFileUpload(
                                    question.questionId,
                                    e.target.files
                                )
                            }
                            className="bg-neutral-850 border-neutral-600 text-neutral-500"
                            accept={question.acceptedFileTypes}
                        />
                        {(formData[question.questionId] || []).length > 0 && (
                            <div className="space-y-1">
                                <div className="text-sm text-gray-500">
                                    Selected files:
                                </div>
                                {(formData[question.questionId] || []).map(
                                    (fileName: string, index: number) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded bg-gray-50 p-2 text-sm"
                                        >
                                            <span className="text-gray-700">
                                                {fileName}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeFile(
                                                        question.questionId,
                                                        index
                                                    )
                                                }
                                                className="ml-2 text-red-500 hover:text-red-700"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )
                                )}
                                <div className="text-xs text-gray-400">
                                    Total files:{' '}
                                    {
                                        (formFiles[question.questionId] || [])
                                            .length
                                    }
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'link':
                return <TextLineInput dataAtom={questionAtom} />;
        }
    };

    return (
        <Card className="p-6">
            <form ref={formRef} noValidate>
                <h2 className="pl-4 text-2xl font-semibold">
                    Submit your team&#39;s SparkJam project
                </h2>

                {questionsList.map((question: any, index: number) => (
                    <div
                        key={question.questionId}
                        className="mb-4 rounded-md p-4 shadow-sm"
                    >
                        <div className="mb-2 flex flex-col space-y-2">
                            <Label
                                htmlFor={question.questionId}
                                className="text-lg font-semibold"
                                required={question.required}
                            >
                                {question.title}
                            </Label>
                            {question.description && (
                                <span className="text-sm text-gray-500">
                                    {question.description}
                                </span>
                            )}
                        </div>
                        <div className="mt-2">
                            {renderQuestionInput(question, index)}
                        </div>
                    </div>
                ))}

                {submitError && (
                    <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
                        {submitError}
                    </div>
                )}
            </form>
        </Card>
    );
}
