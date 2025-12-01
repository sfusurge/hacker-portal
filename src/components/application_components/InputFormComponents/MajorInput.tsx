'use client';

import { type PrimitiveAtom, useAtom, useAtomValue, WritableAtom } from 'jotai';
import type { QuestionMajorInput } from '../types';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { MajorOptions } from './MajorOptions';
import { finalErrCheckAtom } from '../InputForm';

export function MajorInput({
    dataAtom,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionMajorInput>
        | WritableAtom<QuestionMajorInput, [QuestionMajorInput], void>;
}) {
    const [question, setQuestion] = useAtom(dataAtom);
    const [errorMsg, setErrorMsg] = useState('');
    const [isInvalid, setIsInvalid] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const showErrors = useAtomValue(finalErrCheckAtom);

    useEffect(() => {
        if (!inputRef.current) return;

        let message = '';
        const selection = question.selection || [];

        if (question.required && showErrors) {
            if (!Array.isArray(selection) || selection.length === 0) {
                message = 'Required, please select at least one major';
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
            <MajorOptions
                apiUrl={question.apiUrl}
                initialData={question.selection || []}
                onChange={(newSelection) =>
                    setQuestion({ ...question, selection: newSelection })
                }
                required={question.required}
                readOnly={false}
                placeholder={question.title}
                isInvalid={isInvalid}
            />
        </div>
    );
}
