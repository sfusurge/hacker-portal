'use client';

import { ApplicationForm } from '@/lib/hacker_application/ApplicationForm';
import { applicationSet } from '@/lib/hacker_application/applicationQuestionSet';
import { ApplicationData } from '@/lib/hacker_application/types';
import { Provider, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

const questionSetAtom = atomWithStorage('demo question set', structuredClone(applicationSet), {
    getItem(key, initialValue) {
        const obj: ApplicationData = JSON.parse(localStorage.getItem(key) ?? '{}');

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
});

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
    const questions = useAtomValue(questionSetAtom);
    return (
        <div>
            <ApplicationForm
                appDataAtom={questionSetAtom}
                submitApplication={() => {
                    console.log('Submitting!!!');
                    console.log(questions);
                }}
            ></ApplicationForm>
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
