'use client';

import { hackathonAtom, userInfoAtom } from '@/app/(auth)/ClientContext';
import { InputForm } from '@/components/application_components/InputForm';
import { InputFormData } from '@/components/application_components/types';
import {
    loadResponseIntoSchema,
    getResponseMap,
    processResponseForServer,
} from '@/components/application_components/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getFileSize } from '@/components/ui/FileUpload/FileUpload';
import { submitProject } from '@/lib/blobs';
import { trpc } from '@/trpc/client';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { atom, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { redirect } from 'next/navigation';
import { useState } from 'react';
const localAppResponseAtom = atomWithStorage('submit_response', {
    hackathonId: -1,
    email: '',
    response: {} as Record<string, any>,
});

const submitWithLocalAtom = atom(
    (get) => {
        const local = get(localAppResponseAtom);
        const unReadyValue = {
            pages: [],
            id: -1,
            version: -1,
            title: '',
        } as InputFormData;

        const hackathon = get(hackathonAtom);

        if (!hackathon) {
            return unReadyValue;
        }

        const user = get(userInfoAtom);
        const pages = hackathon.submissionQuestionPages;

        if (!user) {
            return unReadyValue;
        }

        if (
            local.hackathonId !== -1 &&
            local.hackathonId === hackathon.id &&
            user.email === local.email
        ) {
            loadResponseIntoSchema(pages, local.response);
        }
        return {
            id: hackathon.id,
            pages,
            version: hackathon.version,
        } as InputFormData;
    },
    (get, set, val: InputFormData) => {
        const userInfo = get(userInfoAtom);
        if (!userInfo || !userInfo.email) {
            return;
        }

        set(localAppResponseAtom, {
            hackathonId: val.id,
            email: userInfo.email,
            response: getResponseMap(val.pages),
        });

        const data = get(hackathonAtom)!;
        set(hackathonAtom, { ...data, submissionQuestionPages: val.pages });
    }
);

export function SubmitFormCard({ teamId }: { teamId: number }) {
    const submitData = useAtomValue(submitWithLocalAtom);
    const [progressMsg, setProgress] = useState('');
    const [projectSubmitted, setProjectSubmitted] = useState(false);

    const submitSubmission = trpc.submissions.submitSubmission.useMutation();

    async function submit() {
        setProgress('Starting uploads...');
        const processedPage = await processResponseForServer(
            submitData.pages,
            async (filename, file) => {
                const blob = await submitProject({
                    fileName: filename,
                    fileContent: file,
                    onUploadProgress: (e) => {
                        setProgress(
                            `Uploading file: ${file.name}(${getFileSize(file.size)}) ${e.percentage}%`
                        );
                    },
                    contentType: file.type,
                    teamId,
                });
                return blob.url;
            }
        );

        setProgress('submitting other responses...');
        const response = getResponseMap(processedPage);
        try {
            await submitSubmission.mutateAsync({
                teamId,
                response,
            });
            setProgress('done!');
            setProjectSubmitted(true);
        } catch (error) {
            console.error('Failed to submit project:', error);
            setProgress('Failed to submit project. Please try again.');
        }
    }

    if (projectSubmitted) {
        return (
            <Card>
                <CardContent>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <span>Your team&apos;s project was submitted!</span>
                        <Button
                            variant={'brand'}
                            hierarchy={'primary'}
                            onClick={() => {
                                redirect('/home');
                            }}
                            trailingIconChild={
                                <ArrowRightIcon style={{ width: '1.5rem' }} />
                            }
                        >
                            Return to Home
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <InputForm
                appDataAtom={submitWithLocalAtom}
                onSubmit={submit}
                disablePageTab
                applicationType="submission"
            />

            {progressMsg.length > 0 && !projectSubmitted && (
                <Card className="mt-4">
                    <CardContent>
                        <p className="text-sm text-white/70">{progressMsg}</p>
                    </CardContent>
                </Card>
            )}
        </>
    );
}
