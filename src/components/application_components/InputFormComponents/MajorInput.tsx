'use client';

import { type PrimitiveAtom, useAtom, useAtomValue, WritableAtom } from 'jotai';
import type { QuestionMajorInput } from '../types';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { MajorOptions } from './MajorOptions';
import { finalErrCheckAtom } from '../InputForm';

export function MajorInput({
    dataAtom,
    disabled = false,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionMajorInput>
        | WritableAtom<QuestionMajorInput, [QuestionMajorInput], void>;
    disabled?: boolean;
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

        const inputValue =
            Array.isArray(selection) && selection.length > 0
                ? selection.join(',')
                : '';
        inputRef.current.value = inputValue;
        inputRef.current.setCustomValidity(message);
        setErrorMsg(message);
        setIsInvalid(message !== '');
    }, [question.selection, question.required, showErrors]);

    const selection = question.selection || [];
    const inputValue =
        Array.isArray(selection) && selection.length > 0
            ? selection.join(',')
            : '';

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
                value={inputValue}
                onChange={() => {}}
            />
            <MajorOptions
                apiUrl={question.apiUrl}
                initialData={question.selection || []}
                onChange={(val) => {
                    if (inputRef.current) {
                        const inputVal =
                            Array.isArray(val) && val.length > 0
                                ? val.join(',')
                                : '';
                        inputRef.current.value = inputVal;
                        const message =
                            question.required &&
                            (!Array.isArray(val) || val.length === 0)
                                ? 'Required, please select at least one major'
                                : '';
                        inputRef.current.setCustomValidity(message);
                        // Dispatch both input and change events to ensure form sees the update
                        inputRef.current.dispatchEvent(
                            new Event('input', {
                                bubbles: true,
                                cancelable: true,
                            })
                        );
                        inputRef.current.dispatchEvent(
                            new Event('change', {
                                bubbles: true,
                                cancelable: true,
                            })
                        );
                    }
                    setQuestion({ ...question, selection: val });
                }}
                required={question.required}
                readOnly={disabled}
                placeholder={question.title}
                isInvalid={isInvalid}
            />
        </div>
    );
}
