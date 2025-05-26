'use client';

import { trpc } from '@/trpc/client';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { InputForm } from '../../../components/application_components/InputForm';
import { hackathonAtom } from '@/hooks/use-hackathon';
import { useHackathon } from '@/hooks/use-hackathon';
import { atom, useAtomValue } from 'jotai';
import {
    InputFormPageData,
    HackathonData,
    InputFormData,
} from '@/components/application_components/types';
import dayjs from 'dayjs';
import {
    getResponseMap,
    loadResponseIntoSchema,
} from '@/components/application_components/utils';
import { atomWithStorage } from 'jotai/utils';
import { userInfoAtom } from '@/app/(auth)/ClientAuthContext';
import { focusAtom } from 'jotai-optics';

const localAppResponseAtom = atomWithStorage('application_response', {
    hackathonId: -1,
    email: '',
    response: {} as Record<string, any>,
});

const hackathonWithLocalAtom = atom(
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

        if (!user || user.email !== local.email) {
            return { ...hackathon };
        }

        const pages = hackathon.pages;

        loadResponseIntoSchema(pages, local.response);
        return { ...hackathon, pages: pages };
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
        set(hackathonAtom, { ...data, pages: val.pages });
    }
);

/**
 * TODO
 * Currently this solutiion creates a slight flick during intial load.
 * todo: investigate in this potential solution
 * https://jotai.org/docs/utilities/storage#server-side-rendering
 */
export default function ApplicationPageComponent() {
    const { hackathon } = useHackathon();
    const hackathonWithResponse = useAtomValue(hackathonWithLocalAtom);
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

    // store user email for local storage user check
    useEffect(() => {
        if (session.data?.user?.email) {
            localStorage.setItem('email', session.data.user.email);
        }
    }, [session]);

    useEffect(() => {
        if (application.data) {
            alert('You have already applied! Redirecting to home.');
            return redirect('/home');
        }

        if (hackathon?.id && !application.data) {
            application.refetch();
        }
    }, [application, hackathon]);

    // reserve extra top padding for this page
    useEffect(() => {
        document.body.style.setProperty('--paddingTop', '5rem');
    }, []);

    return (
        <InputForm
            appDataAtom={hackathonWithLocalAtom}
            submitApplication={() => {
                if (application.data) {
                    return;
                }

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
