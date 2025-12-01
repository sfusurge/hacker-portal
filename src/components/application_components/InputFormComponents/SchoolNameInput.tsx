'use client';

import { type PrimitiveAtom, useAtom, useAtomValue, WritableAtom } from 'jotai';
import type { QuestionSchoolName } from '../types';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { SchoolOptions } from '@/components/ui/SchoolOptions/SchoolOptions';
import { finalErrCheckAtom } from '../InputForm';

export function SchoolNameInput({
    dataAtom,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionSchoolName>
        | WritableAtom<QuestionSchoolName, [QuestionSchoolName], void>;
}) {
    const [question, setQuestion] = useAtom(dataAtom);
    const [errorMsg, setErrorMsg] = useState('');
    const [isInvalid, setIsInvalid] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const showErrors = useAtomValue(finalErrCheckAtom);

    useEffect(() => {
        if (!inputRef.current) return;

        let message = '';
        const selection = question.selection || '';

        if (question.required && showErrors) {
            if (!selection || selection.trim().length === 0) {
                message = 'Required, please select a school';
            }
        }

        inputRef.current.setCustomValidity(message);
        setErrorMsg(message);
        setIsInvalid(message !== '');
    }, [question.selection, question.required, showErrors]);

    return (
        <div
            className={cn(
                'relative',
                isInvalid && [
                    'after:content-[var(--errorMsg)]',
                    'after:block',
                    'after:text-xs',
                    'after:text-danger-400',
                    'after:mt-2',
                ]
            )}
            style={
                {
                    '--errorMsg': `"${errorMsg}"`,
                } as React.CSSProperties
            }
        >
            <input
                ref={inputRef}
                type="text"
                style={{ display: 'none' }}
                required={question.required}
                defaultValue="na"
            />
            <SchoolOptions
                apiUrl={question.apiUrl}
                initialData={question.selection}
                onChange={(val) => setQuestion({ ...question, selection: val })}
                required={question.required}
                readOnly={false}
                placeholder={question.title}
                isInvalid={isInvalid}
            />
        </div>
    );
}
