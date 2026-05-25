'use client';

import {
    currentTeamAtom,
    hackathonAtom,
    userInfoAtom,
} from '@/app/(auth)/ClientContext';
import { InputForm } from '@/components/application_components/InputForm';
import { InputFormData } from '@/components/application_components/types';
import {
    loadResponseIntoSchema,
    getResponseMap,
    processResponseForServer,
} from '@/components/application_components/utils';
import { Card, CardContent } from '@/components/ui/card';
import { getFileSize } from '@/components/ui/FileUpload/FileUpload';
import { toast } from '@/hooks/use-toast';
import { submitProject } from '@/lib/blobs';
import { isSubmissionWindowOpen } from '@/lib/submissionWindow';
import { trpc } from '@/trpc/client';
import ProjectSubmissionSuccess from '@/app/(auth)/(team)/teamComponents/submit/ProjectSubmissionSuccess';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useEffect, useState } from 'react';
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

export function SubmitFormCard({
    teamId,
    teamName,
    teamPictureUrl,
}: {
    teamId: number;
    teamName: string;
    teamPictureUrl?: string | null;
}) {
    const submitData = useAtomValue(submitWithLocalAtom);
    const hackathon = useAtomValue(hackathonAtom);
    const setCurrentTeam = useSetAtom(currentTeamAtom);
    const [progressMsg, setProgress] = useState('');
    const [projectSubmitted, setProjectSubmitted] = useState(false);

    useEffect(() => {
        setCurrentTeam({
            id: teamId,
            name: teamName,
            teamPictureUrl: teamPictureUrl ?? null,
        });
        return () => setCurrentTeam(null);
    }, [teamId, teamName, teamPictureUrl, setCurrentTeam]);

    const submitSubmission = trpc.submissions.submitSubmission.useMutation();

    async function submit() {
        if (
            !hackathon ||
            !isSubmissionWindowOpen(
                Date.now(),
                hackathon.submissionOpen?.toDate() ?? null,
                hackathon.submissionDeadline.toDate()
            )
        ) {
            const message =
                'Submissions are only accepted during the open submission window.';
            setProgress(message);
            toast({
                title: 'Submission failed',
                description: message,
                variant: 'error',
            });
            throw new Error(message);
        }

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
                hackathonId: submitData.id,
                response,
            });
            setProgress('done!');
            setProjectSubmitted(true);
        } catch (error) {
            console.error('Failed to submit project:', error);
            const message = 'Failed to submit project. Please try again.';
            setProgress(message);
            toast({
                title: 'Submission failed',
                description: message,
                variant: 'error',
            });
            throw error instanceof Error ? error : new Error(message);
        }
    }

    if (projectSubmitted) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <ProjectSubmissionSuccess />
            </div>
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
                        <p className="text-sm text-white/60">{progressMsg}</p>
                    </CardContent>
                </Card>
            )}
        </>
    );
}
