'use client';

import { type PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import type { QuestionMajorInput } from '../types';
import { useState, useEffect, useRef } from 'react';
import { MajorOptions } from './MajorOptions';
import style from './MajorInput.module.css';

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

    useEffect(() => {
        if (!inputRef.current) return;

        let message = '';
        const selection = question.selection || [];

        if ((question.required ?? false) && !disabled) {
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
        if (!message) {
            setIsInvalid(false);
        }
    }, [disabled, question.selection, question.required]);

    const selection = question.selection || [];
    const inputValue =
        Array.isArray(selection) && selection.length > 0
            ? selection.join(',')
            : '';

    return (
        <div
            className={style.field}
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
                required={(question.required ?? false) && !disabled}
                value={inputValue}
                onChange={() => {}}
                onInvalid={() => {
                    setIsInvalid(true);
                }}
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
                            (question.required ?? false) &&
                            !disabled &&
                            (!Array.isArray(val) || val.length === 0)
                                ? 'Required, please select at least one major'
                                : '';
                        inputRef.current.setCustomValidity(message);
                        if (!message) {
                            setIsInvalid(false);
                        }
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
