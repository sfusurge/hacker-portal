'use client';

import { trpc } from '@/trpc/client';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { InputForm } from '../../../components/application_components/InputForm';

import { atom, useAtomValue } from 'jotai';
import { InputFormData } from '@/components/application_components/types';
import {
    getResponseMap,
    loadResponseIntoSchema,
} from '@/components/application_components/utils';
import { atomWithStorage } from 'jotai/utils';
import { userInfoAtom } from '@/app/(auth)/ClientContext';
import { hackathonAtom } from '@/app/(auth)/ClientContext';

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
    const hackathon = useAtomValue(hackathonAtom);
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

    // useEffect(() => {
    //     if (application.data !== null) {
    //         alert('Already applied!');
    //         redirect('/home'); // TODO make this look good
    //     }
    // }, [application]);

    // reserve extra top padding for this page
    useEffect(() => {
        document.body.style.setProperty('--paddingTop', '5rem');
    }, []);

    return (
        <InputForm
            appDataAtom={applicationWithLocalAtom}
            onSubmit={() => {
                const response = getResponseMap(hackathonWithResponse.pages);
                submitApplication.mutate({
                    hackathonId: hackathon!.id,
                    response: response,
                });

                redirect('/application/submitted');
            }}
        ></InputForm>
    );
}
