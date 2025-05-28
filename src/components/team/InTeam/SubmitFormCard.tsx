'use client';

import { userInfoAtom } from '@/app/(auth)/ClientAuthContext';
import { InputForm } from '@/components/application_components/InputForm';
import { submittedAtom } from '@/components/application_components/InputFormComponents/shared';
import { InputFormData } from '@/components/application_components/types';
import {
    loadResponseIntoSchema,
    getResponseMap,
    processResponseForServer,
} from '@/components/application_components/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
} from '@/components/ui/dialog';
import { getFileSize } from '@/components/ui/FileUpload/FileUpload';
import { hackathonAtom } from '@/hooks/use-hackathon';
import { submitProject } from '@/lib/blobs';
import { trpc } from '@/trpc/client';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { atom, useAtom, useAtomValue } from 'jotai';
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

        console.log('settingh', {
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
    const [submitting, setSubmitting] = useState(false);
    const [progressMsg, setProgress] = useState('');
    const [submitted, setSubmitted] = useAtom(submittedAtom);

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
        submitSubmission.mutate({
            teamId,
            response,
        });
        setProgress('done!');
        setSubmitted(true);
    }

    if (submitted) {
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
                        <span>Your team's project was submitted!</span>
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
                onSubmit={async () => {
                    setSubmitting(true);
                }}
                disablePageTab
            />

            <Dialog
                modal
                open={submitting}
                onOpenChange={(o) => {
                    if (!o) {
                        setSubmitting(false);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Submit your project?</DialogTitle>
                    </DialogHeader>
                    <p>Once submitted you cannot edit your project again.</p>

                    <DialogFooter>
                        <Button
                            variant={'default'}
                            hierarchy={'primary'}
                            onClick={() => {
                                setSubmitting(false);
                            }}
                        >
                            No, cancel
                        </Button>
                        <Button
                            variant={'brand'}
                            hierarchy={'primary'}
                            onClick={() => {
                                setSubmitting(false);
                                submit();
                            }}
                        >
                            Yes, submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog modal open={progressMsg.length > 0}>
                <DialogContent>
                    <DialogHeader>
                        <DialogHeader>Submitting your project ...</DialogHeader>
                    </DialogHeader>

                    <DialogDescription>{progressMsg}</DialogDescription>

                    {submitted && (
                        <DialogFooter>
                            <Button
                                hierarchy={'primary'}
                                variant={'brand'}
                                onClick={() => {
                                    setSubmitting(false);
                                    setProgress('');
                                    setSubmitted(true);
                                }}
                            >
                                Acknowledged!
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
