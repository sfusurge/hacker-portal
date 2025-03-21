'use client';

import { ApplicationData, ApplicationQuestion } from './types';
import style from './ApplicationForm.module.css';
import { useEffect, useMemo, useRef } from 'react';
import { SkewmorphicButton } from '@/components/ui/SkewmorphicButton/SkewmorphicButton';

/**
 * Review Page Gets a submit button if mobile mode.
 * @
 * @
 */
export function ReviewPage({
    application,
    submit,
    mobileMode = false,
}: {
    application: ApplicationData;
    submit: () => void;
    mobileMode?: boolean;
}) {
    function getQuestionResponse(question: ApplicationQuestion) {
        let res = '';
        switch (question.type) {
            case 'text-line':
            case 'text-area':
            case 'number':
                res = question.value as string;
                break;

            case 'checkbox':
                res = question.value ? 'yes' : 'no';
                break;

            case 'multiple-checkbox':
                res = question.choices
                    .filter((item) => item.value)
                    .map((item) => item.name)
                    .join(', ');
                break;
            case 'multiple-choice':
                res = question.value as string;
                break;
            default:
                break;
        }

        if (res === undefined || res.length === 0) {
            return 'N/A';
        }
        return res;
    }

    const flattenedQuestions = useMemo(() => {
        const questions: ApplicationQuestion[] = [];

        for (const page of application.pages) {
            for (const question of page.questions) {
                questions.push(question);
            }
        }

        return questions;
    }, [application]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                padding: '24px',
                marginBottom: '7rem',
            }}
        >
            <h1 className="text-2xl font-medium">Review Application</h1>

            {flattenedQuestions.map((question, index) => {
                return (
                    <div key={index}>
                        <h3 className={style.title}>{question.title}</h3>
                        <span className={style.description}>
                            {getQuestionResponse(question)}
                        </span>
                    </div>
                );
            })}

            {mobileMode && (
                <SkewmorphicButton
                    onClick={submit}
                    style={{ background: 'var(--brand-500)' }}
                >
                    Submit!
                </SkewmorphicButton>
            )}
        </div>
    );
}
