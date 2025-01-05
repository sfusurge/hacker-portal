'use client';

import { TextLineInput } from '@/lib/hacker_application/application_question_fields/TextLineInput';
import { ApplicationForm } from '@/lib/hacker_application/ApplicationForm';
import { applicationSet } from '@/lib/hacker_application/applicationQuestionSet';
import { Provider, useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useEffect } from 'react';

const questionSetAtom = atomWithStorage(
    'demo question set',
    structuredClone(applicationSet)
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
    const [questions, setQuestions] = useAtom(questionSetAtom);
    useEffect(() => {
        if (questions.version !== applicationSet.version) {
            // if question versioin, then discard local version.
            setQuestions(structuredClone(applicationSet));
        }
    }, [questions]);

    return (
        <div>
            <ApplicationForm appDataAtom={questionSetAtom}></ApplicationForm>
            <pre
                style={{
                    width: '700px',
                    height: '800px',
                    overflow: 'scroll',
                }}
            >
                <code>{JSON.stringify(questions, undefined, 2)}</code>
            </pre>
        </div>
    );
}
