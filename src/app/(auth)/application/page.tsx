'use client';

import { ApplicationForm } from '@/lib/hacker_application/ApplicationForm';
import { JOURNEY_HACK_QUESTIONS } from '@/lib/hacker_application/applicationQuestionSet';
import { ApplicationData } from '@/lib/hacker_application/types';
import { trpc } from '@/trpc/client';
import { Provider, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { SkewmorphicButton } from '@/components/ui/SkewmorphicButton/SkewmorphicButton';
import style from '@/lib/hacker_application/ApplicationForm.module.css';

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

    const [finished, setFinished] = useState(false);

    const returnHome = () => {
        redirect('/');
    };
    /*
     * submitApplication.mutate({
     *   response: {
     *    hackathonId: <hackathonId>, // some hardcoded value
     *    [questionId]: response value as any
     *   }
     * })
     * */
    return (
        <div className="flex flex-col justify-center items-center h-full">
            {!finished && (
                <ApplicationForm
                    appDataAtom={questionSetAtom}
                    submitApplication={() => {
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
                        setFinished(true);
                    }}
                ></ApplicationForm>
            )}
            {finished && (
                <div className="flex flex-col items-center justify-center gap-10">
                    <Image
                        src={'/login/team.svg'}
                        alt={'The Surge Team!'}
                        width={430}
                        height={317}
                    />
                    <div className="flex flex-col gap-1 justify-center items-center">
                        <h1 className="text-white font-sans text-3xl font-semibold">
                            Application Submitted!
                        </h1>
                        <h2 className="text-white/60 text-sm font-sans">
                            Your application has been submitted and will go
                            under review by the JourneyHacks team soon.
                        </h2>
                    </div>

                    <SkewmorphicButton
                        onClick={returnHome}
                        className={style.nextButton}
                    >
                        Back to Dashboard
                    </SkewmorphicButton>
                </div>
            )}
        </div>
    );
}
