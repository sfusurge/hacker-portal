'use client';

import { type PrimitiveAtom, useAtom, useAtomValue, WritableAtom } from 'jotai';
import type { QuestionApiDropdown } from '../types';
import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ApiDropdown } from '@/components/ui/ApiDropdown/ApiDropdown';
import { finalErrCheckAtom } from '../InputForm';

export function ApiDropdownInput({
    dataAtom,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionApiDropdown>
        | WritableAtom<QuestionApiDropdown, [QuestionApiDropdown], void>;
}) {
    const [question, setQuestion] = useAtom(dataAtom);
    const [errorMsg, setErrorMsg] = useState('');
    const [isInvalid, setIsInvalid] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const showErrors = useAtomValue(finalErrCheckAtom);

    const getErrorMessage = useCallback(() => {
        const words = question.title.toLowerCase().split(/\s+/);
        const skipWords = [
            'current',
            'please',
            'select',
            'enter',
            'choose',
            'pick',
        ];
        const optionName =
            words.find(
                (word) => word.length > 0 && !skipWords.includes(word)
            ) || 'option';
        return `Required, please select a ${optionName}`;
    }, [question.title]);

    useEffect(() => {
        if (!inputRef.current) return;

        let message = '';
        const selection = question.selection || '';

        if (question.required && showErrors) {
            if (!selection || selection.trim().length === 0) {
                message = getErrorMessage();
            }
        }

        inputRef.current.setCustomValidity(message);
        setErrorMsg(message);
        setIsInvalid(message !== '');
    }, [question.selection, question.required, showErrors, getErrorMessage]);

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

            <ApiDropdown
                apiUrl={question.apiUrl}
                initialData={question.selection}
                onChange={(val) => setQuestion({ ...question, selection: val })}
                required={question.required}
                readOnly={false}
                placeholder={question.placeHolder || question.title}
                isInvalid={isInvalid}
            />
        </div>
    );
}
