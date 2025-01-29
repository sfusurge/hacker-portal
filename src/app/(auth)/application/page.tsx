'use client';

import { ApplicationForm } from '@/lib/hacker_application/ApplicationForm';
import { JOURNEY_HACK_QUESTIONS } from '@/lib/hacker_application/applicationQuestionSet';
import { ApplicationData } from '@/lib/hacker_application/types';
import { trpc } from '@/trpc/client';
import { useAtom, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

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
    const submitApplication = trpc.applications.submitApplication.useMutation();
    const applicationSubmitted =
        trpc.applications.userAlreadySubmitted.useQuery({});
    const [questions, setQuestions] = useAtom(questionSetAtom);

    const session = useSession();

    useEffect(() => {
        if (session.data?.user?.email) {
            if (!localStorage.getItem('email')) {
                localStorage.setItem('email', session.data.user.email);
            } else {
                if (localStorage.getItem('email') !== session.data.user.email) {
                    localStorage.setItem('email', session.data.user.email);

                    setQuestions(structuredClone(JOURNEY_HACK_QUESTIONS)); // reset if its somebody else's email
                }
            }
        }
    }, [session]);

    return (
        <ApplicationForm
            appDataAtom={questionSetAtom}
            submitApplication={() => {
                if (applicationSubmitted.data) {
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

                redirect('/application/submitted');
            }}
        ></ApplicationForm>
    );
}
