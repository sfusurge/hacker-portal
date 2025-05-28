'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAtom } from 'jotai';
import {
    formDataAtom,
    formFilesAtom,
    isSubmittingAtom,
    submitSuccessAtom,
    submitErrorAtom,
} from './SubmissionForm';
import { useState, useEffect } from 'react';
import { trpc } from '@/trpc/client';
import { SkewmorphicButton } from '@/components/ui/SkewmorphicButton/SkewmorphicButton';
import { cn } from '@/lib/utils';
import style from '@/components/application_components/InputForm.module.css';
import { upload } from '@vercel/blob/client';

export default function SubmitButton({
    teamId,
    hackathonId,
}: {
    teamId?: number;
    hackathonId: number;
}) {
    const [formData] = useAtom(formDataAtom);
    const [formFiles] = useAtom(formFilesAtom);
    const [isSubmitting, setIsSubmitting] = useAtom(isSubmittingAtom);
    const [submitSuccess, setSubmitSuccess] = useAtom(submitSuccessAtom);
    const [submitError, setSubmitError] = useAtom(submitErrorAtom);
    const [isFormValid, setIsFormValid] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<
        Record<string, number>
    >({});

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

    // Function to upload a single file using Vercel's client-side upload
    const uploadFileToBlob = async (
        file: File,
        questionId: string
    ): Promise<string> => {
        try {
            console.log(
                'Uploading file:',
                file.name,
                'for question:',
                questionId
            );

            // Generate a unique filename
            const timestamp = Date.now();
            const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `${questionId}_${timestamp}_${sanitizedFileName}`;

            // Use Vercel's client-side upload with your existing API
            const blob = await upload(fileName, file, {
                access: 'public',
                handleUploadUrl: '/api/blob/project', // Dedicated route for submission files
                clientPayload: JSON.stringify({
                    teamId,
                    hackathonId,
                }),
            });

            console.log('Upload successful:', blob.url);
            return blob.url;
        } catch (error) {
            console.error('Error uploading file:', file.name, error);
            throw new Error(
                `Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    };

    // Function to upload all files for a question
    const uploadFilesForQuestion = async (
        questionId: string,
        files: File[]
    ): Promise<string[]> => {
        const uploadPromises = files.map(async (file, index) => {
            const url = await uploadFileToBlob(file, questionId);

            // Update progress
            setUploadProgress((prev) => ({
                ...prev,
                [`${questionId}_${index}`]: 100,
            }));

            return url;
        });

        return Promise.all(uploadPromises);
    };

    const handleSubmit = async () => {
        if (!teamId || !hackathonId) {
            setSubmitError('Missing team or hackathon information');
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);
        setUploadProgress({});

        try {
            // First, upload all files and get their URLs
            const uploadedFileUrls: Record<string, string[]> = {};

            for (const [questionId, files] of Object.entries(formFiles)) {
                if (files && files.length > 0) {
                    try {
                        const urls = await uploadFilesForQuestion(
                            questionId,
                            files
                        );
                        uploadedFileUrls[questionId] = urls;
                    } catch (error) {
                        throw new Error(
                            `Failed to upload files for ${questionId}: ${error}`
                        );
                    }
                }
            }

            // Format the data for submission
            const formattedData = Object.keys(formData).map((questionId) => {
                let value = formData[questionId];

                // Replace file names with uploaded URLs for file-upload questions
                if (uploadedFileUrls[questionId]) {
                    value = uploadedFileUrls[questionId];
                }

                return {
                    questionId,
                    value: value,
                };
            });

            // Submit the form with file URLs
            await submitMutation.mutateAsync({
                teamId,
                hackathonId,
                response: { questions: formattedData },
            });
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitError(
                `Submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
            setIsSubmitting(false);
        }
    };

    // Calculate overall upload progress
    const totalFiles = Object.values(formFiles).reduce(
        (sum, files) => sum + files.length,
        0
    );
    const completedUploads = Object.keys(uploadProgress).length;
    const overallProgress =
        totalFiles > 0 ? (completedUploads / totalFiles) * 100 : 0;

    return (
        <div className="space-y-4">
            {isSubmitting && totalFiles > 0 && (
                <Card className="p-4">
                    <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                            Uploading files... ({completedUploads}/{totalFiles})
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${overallProgress}%` }}
                            />
                        </div>
                    </div>
                </Card>
            )}

            <SkewmorphicButton
                onClick={handleSubmit}
                disabled={isSubmitting || !isFormValid || submitSuccess}
                className={cn(style.nextButton)}
            >
                {isSubmitting ? 'Submitting...' : 'Submit'}
            </SkewmorphicButton>
        </div>
    );
}
