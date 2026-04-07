'use client';

import { trpc } from '@/trpc/client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { InputForm } from '../../../components/application_components/InputForm';
import { toast } from '@/hooks/use-toast';

import { atom, useAtomValue } from 'jotai';
import { InputFormData } from '@/components/application_components/types';
import {
    getApplicationAutofillFromUser,
    getResponseMap,
    loadResponseIntoSchema,
    mergeProfileDefaultsWithLocalResponse,
    processResponseForServer,
} from '@/components/application_components/utils';
import { atomWithStorage } from 'jotai/utils';
import { userInfoAtom } from '@/app/(auth)/ClientContext';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { submitFile } from '@/lib/blobs';

const localAppResponseAtom = atomWithStorage('application_response', {
    hackathonId: -1,
    email: '',
    response: {} as Record<string, any>,
});

const applicationWithLocalAtom = atom(
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
        const pages = hackathon.applicationQuestionPages;

        if (!user) {
            return unReadyValue;
        }

        const profileDefaults = getApplicationAutofillFromUser(user);
        const hasSavedDraft =
            local.hackathonId !== -1 &&
            local.hackathonId === hackathon.id &&
            user.email === local.email;

        const responseToLoad = mergeProfileDefaultsWithLocalResponse(
            profileDefaults,
            hasSavedDraft ? local.response : {}
        );

        loadResponseIntoSchema(pages, responseToLoad);
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
        set(hackathonAtom, { ...data, applicationQuestionPages: val.pages });
    }
);

/**
 * TODO
 * Currently this solutiion creates a slight flick during intial load.
 * todo: investigate in this potential solution
 * https://jotai.org/docs/utilities/storage#server-side-rendering
 */
export default function ApplicationPageComponent() {
    const router = useRouter();
    const hackathon = useAtomValue(hackathonAtom);
    const user = useAtomValue(userInfoAtom);
    const hackathonWithResponse = useAtomValue(applicationWithLocalAtom);
    const submitApplication = trpc.applications.submitApplication.useMutation();
    const application = trpc.applications.getCurrentApplication.useQuery({
        hackathonId: hackathon.id,
    });
    const session = useSession();

    // store user email for local storage user check
    useEffect(() => {
        if (session.data?.user?.email) {
            localStorage.setItem('email', session.data.user.email);
        }
    }, [session]);

    useEffect(() => {
        if (application.data !== null && application.data !== undefined) {
            toast({
                title: 'Application submitted',
                description:
                    'You have submitted your application for this hackathon.',
                variant: 'info',
            });
            router.push('/application/submitted');
        }
    }, [application, router]);

    // reserve extra top padding for this page
    useEffect(() => {
        document.body.style.setProperty('--paddingTop', '5rem');
    }, []);

    return (
        <InputForm
            appDataAtom={applicationWithLocalAtom}
            onSubmit={async () => {
                const pagesWithFileUrl = await processResponseForServer(
                    hackathonWithResponse.pages,
                    async (fileName, file) => {
                        const blob = await submitFile({
                            file,
                            path: fileName,
                            hackathonId: hackathon.id,
                            userId: user.id,
                            uploadPath: 'resumes',
                        });

                        return blob.url;
                    },
                    (question) =>
                        question.title?.toLowerCase().includes('resume')
                            ? `resumes/hackathon-${hackathon.id}/user-${user.id}.pdf`
                            : null
                );

                const response = getResponseMap(pagesWithFileUrl);

                await new Promise<void>((resolve, reject) => {
                    submitApplication.mutate(
                        {
                            hackathonId: hackathon.id,
                            response,
                        },
                        {
                            onSuccess: () => {
                                resolve();
                            },
                            onError: (error) => {
                                reject(error);
                            },
                        }
                    );
                });
            }}
        ></InputForm>
    );
}
