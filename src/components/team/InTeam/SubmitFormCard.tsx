'use client';

import { userInfoAtom } from '@/app/(auth)/ClientAuthContext';
import { InputForm } from '@/components/application_components/InputForm';
import { InputFormData } from '@/components/application_components/types';
import {
    loadResponseIntoSchema,
    getResponseMap,
    processResponseForServer,
} from '@/components/application_components/utils';
import { hackathonAtom } from '@/hooks/use-hackathon';
import { trpc } from '@/trpc/client';
import { atom, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
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

export function SubmitFormCard({ teamId: _teamId }: { teamId: number }) {
    const submitData = useAtomValue(submitWithLocalAtom);
    const submitSubmission = trpc.submissions.submitSubmission.useMutation();
    return (
        <InputForm
            appDataAtom={submitWithLocalAtom}
            onSubmit={async () => {
                const processedPage = await processResponseForServer(
                    submitData.pages,
                    async (filename, file) => {
                        ///
                        return 'htttp://';
                    }
                );

                const response = getResponseMap(processedPage);
                submitSubmission.mutate({
                    teamId: _teamId,
                    response,
                });
            }}
            disablePageTab
        />
    );
}
