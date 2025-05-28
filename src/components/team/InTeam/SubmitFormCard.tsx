'use client';

import { userInfoAtom } from '@/app/(auth)/ClientAuthContext';
import { InputForm } from '@/components/application_components/InputForm';
import { InputFormData } from '@/components/application_components/types';
import {
    loadResponseIntoSchema,
    getResponseMap,
} from '@/components/application_components/utils';
import { hackathonAtom } from '@/hooks/use-hackathon';
import { atom, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useEffect } from 'react';

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

export function SubmitFormCard() {
    const submitData = useAtomValue(submitWithLocalAtom);

    return (
        <InputForm
            appDataAtom={submitWithLocalAtom}
            onSubmit={() => {
                console.log(submitData);
            }}
            disablePageTab
        />
    );
}
