'use client';

import { ApplicationForm } from '@/lib/hacker_application/ApplicationForm';
import { JOURNEY_HACK_QUESTIONS } from '@/lib/hacker_application/applicationQuestionSet';
import { ApplicationData } from '@/lib/hacker_application/types';
import { trpc } from '@/trpc/client';
import { Provider, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

const questionSetAtom = atomWithStorage(
    'demo question set',
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

export default function ApplicationTest() {
    /**
     * // TODO
     * Currently this solutiion creates a slight flick during intial load.
     * todo: investigate in this potential solution
     * https://jotai.org/docs/utilities/storage#server-side-rendering
     */
    return (
        <Provider>
            <ApplicationWithProvider></ApplicationWithProvider>
        </Provider>
    );
}

function ApplicationWithProvider() {
    const submitApplication = trpc.applications.submitApplication.useMutation();

    const questions = useAtomValue(questionSetAtom);

    return (
        <div>
            <ApplicationForm
                appDataAtom={questionSetAtom}
                submitApplication={() => {
                    console.log(questions);

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
                }}
            ></ApplicationForm>
        </div>
    );
}
