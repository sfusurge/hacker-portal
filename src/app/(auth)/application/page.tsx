'use client';

import { trpc } from '@/trpc/client';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ApplicationForm } from './application_components/ApplicationForm';
import { hackathonAtom } from '@/hooks/use-hackathon';
import { useHackathon } from '@/hooks/use-hackathon';
import { atom, PrimitiveAtom, WritableAtom } from 'jotai';
import {
    ApplicationPage,
    HackathonData,
} from '@/app/(auth)/application/application_components/types';
import dayjs from 'dayjs';
import { getResponseMap } from '@/app/(auth)/application/application_components/utils';

/**
 * TODO
 * Currently this solutiion creates a slight flick during intial load.
 * todo: investigate in this potential solution
 * https://jotai.org/docs/utilities/storage#server-side-rendering
 */
export default function Application() {
    const { hackathon, setHackathon } = useHackathon();

    const submitApplication = trpc.applications.submitApplication.useMutation();

    const application = trpc.applications.getCurrentApplication.useQuery(
        {
            hackathonId: hackathon?.id!,
        },
        {
            enabled: false,
        }
    );

    const session = useSession();
    const [initialLoad, setIniLoad] = useState(true);
    // application data depends on hackathon, fetch after hackathon is loaded
    useEffect(() => {
        if (!session.data?.user?.email) {
            return;
        }

        if (hackathon && initialLoad) {
            application.refetch();

            const storageId = `application-${hackathon?.id}-${session.data?.user?.email}`;
            if (localStorage.getItem(storageId)) {
                setTimeout(() => {
                    const storedResponse = JSON.parse(
                        localStorage.getItem(storageId)!
                    );

                    console.log(storedResponse);

                    // load question
                    for (const page of hackathon.pages) {
                        for (const question of page.questions) {
                            if (question.questionId in storedResponse) {
                                const id = question.questionId;
                                switch (question.type) {
                                    case 'name':
                                        // pass, name not used yet
                                        break;

                                    case 'multiple-checkbox':
                                        const choices = new Map<
                                            string,
                                            number
                                        >();
                                        for (
                                            let i = 0;
                                            i < question.choices.length;
                                            i++
                                        ) {
                                            choices.set(
                                                question.choices[i].data,
                                                i
                                            );
                                        }
                                        for (const item of storedResponse[id]) {
                                            if (choices.has(item)) {
                                                question.choices[
                                                    choices.get(item)!
                                                ].value = true;
                                            } else if (question.allowOther) {
                                                question.otherValue = item;
                                            }
                                        }
                                        break;

                                    default:
                                        question.value = storedResponse[id];
                                }
                            }
                        }
                    }

                    setHackathon({ ...hackathon });
                }, 1000);
            }
            setIniLoad(false);
        } else if (hackathon && !initialLoad) {
            const storageId = `application-${hackathon?.id}-${session.data?.user?.email}`;
            console.log(getResponseMap(hackathon.pages));

            localStorage.setItem(
                storageId,
                JSON.stringify(getResponseMap(hackathon.pages))
            );
        }
    }, [hackathon, initialLoad, session]);

    // store user email for local storage user check
    useEffect(() => {
        if (session.data?.user?.email) {
            localStorage.setItem('email', session.data.user.email);
        }
    }, [session]);

    useEffect(() => {
        if (application.data) {
            redirect('/home');
        }
    }, [application]);

    // reserve extra top padding for this page
    useEffect(() => {
        document.body.style.setProperty('--paddingTop', '5rem');
    }, []);

    const validatedHackathonAtom = atom(
        (get) => {
            const data = get(hackathonAtom);
            if (data) {
                return data;
            }
            return {
                id: -1,
                endDate: dayjs(),
                hackathonName: '',
                pages: [],
                startDate: dayjs(),
                submissionDeadline: dayjs(),
                version: -1,
                submissionTime: '',
                title: '',
            } as HackathonData;
        },
        (get, set, val: HackathonData) => {
            set(hackathonAtom, val);
        }
    );

    return (
        <ApplicationForm
            appDataAtom={validatedHackathonAtom}
            submitApplication={() => {
                if (application.data) {
                    return;
                }

                const response = getResponseMap(hackathon?.pages ?? []);

                console.log(`Submitting ${JSON.stringify(response)}`);

                submitApplication.mutate({
                    hackathonId: hackathon!.id,
                    response: response,
                });

                redirect('/application/submitted');
            }}
        ></ApplicationForm>
    );
}
