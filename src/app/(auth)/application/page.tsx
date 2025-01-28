'use client';

import { ApplicationForm } from '@/lib/hacker_application/ApplicationForm';
import { JOURNEY_HACK_QUESTIONS } from '@/lib/hacker_application/applicationQuestionSet';
import { ApplicationData } from '@/lib/hacker_application/types';
import { trpc } from '@/trpc/client';
import { Provider, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { redirect } from 'next/navigation';

const questionSetAtom = atomWithStorage(
    'question set',
    structuredClone(JOURNEY_HACK_QUESTIONS),
    {
        getItem(key, initialValue) {
            const obj: ApplicationData = JSON.parse(
                localStorage.getItem(key) ?? '{}'
            );

            if (obj.version === initialValue.version) {
                return obj;
            } else {
                return initialValue;
            }
        },
        setItem(key, newValue) {
            localStorage.setItem(key, JSON.stringify(newValue));
        },
        removeItem(key) {
            localStorage.removeItem(key);
        },
    }
);

/**
 * // TODO
 * Currently this solutiion creates a slight flick during intial load.
 * todo: investigate in this potential solution
 * https://jotai.org/docs/utilities/storage#server-side-rendering
 */

export default function Application() {
    console.log(trpc);

    const submitApplication = trpc.applications.submitApplication.useMutation();
    const applicationSubmitted =
        trpc.applications.userAlreadySubmitted.useQuery({});
    const questions = useAtomValue(questionSetAtom);

    /*
     * submitApplication.mutate({
     *   response: {
     *    hackathonId: <hackathonId>, // some hardcoded value
     *    [questionId]: response value as any
     *   }
     * })
     * */
    return (
        <ApplicationForm
            appDataAtom={questionSetAtom}
            submitApplication={() => {
                if (applicationSubmitted) {
                    return;
                }

                const response = questions.pages
                    .flatMap((page) => page.questions)
                    .map((question) => {
                        const questionId = question.questionId;
                        const type = question.type;

                        if (type === 'multiple-checkbox') {
                            return {
                                questionId,
                                value: question.choices
                                    .filter(({ value }) => value)
                                    .map(({ data }) => data),
                            };
                        }

                        if (type === 'name') {
                            return {
                                questionId,
                                value: `${question.firstName} ${question.lastName}`,
                            };
                        }

                        return {
                            questionId,
                            value: question.value,
                        };
                    })
                    .reduce(
                        (response, { questionId, value }) => {
                            response[questionId] = value;

                            return response;
                        },
                        {} as Record<string, any>
                    );

                console.log(`Submitting ${JSON.stringify(response)}`);

                submitApplication.mutate({
                    hackathonId: 1,
                    response: response,
                });

                // TODO, show submittion screen
                redirect('/application/submitted');
            }}
        ></ApplicationForm>
    );
}
