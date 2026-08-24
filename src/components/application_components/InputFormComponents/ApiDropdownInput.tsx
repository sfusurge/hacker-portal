'use client';

import { type PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import type { QuestionApiDropdown } from '../types';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiDropdown } from '@/components/ui/ApiDropdown/ApiDropdown';
import style from './ApiDropdownInput.module.css';

export function ApiDropdownInput({
    dataAtom,
    disabled = false,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionApiDropdown>
        | WritableAtom<QuestionApiDropdown, [QuestionApiDropdown], void>;
    disabled?: boolean;
}) {
    const [question, setQuestion] = useAtom(dataAtom);
    const [errorMsg, setErrorMsg] = useState('');
    const [isInvalid, setIsInvalid] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

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

    const selectionStr =
        typeof question.selection === 'string' ? question.selection : '';

    useEffect(() => {
        if (!inputRef.current) return;

        let message = '';

        if ((question.required ?? false) && !disabled) {
            if (!selectionStr || selectionStr.trim().length === 0) {
                message = getErrorMessage();
            }
        }

        const inputValue =
            selectionStr && selectionStr.trim().length > 0 ? selectionStr : '';
        inputRef.current.value = inputValue;
        inputRef.current.setCustomValidity(message);
        setErrorMsg(message);
        if (!message) {
            setIsInvalid(false);
        }
    }, [disabled, selectionStr, question.required, getErrorMessage]);

    const inputValue =
        selectionStr && selectionStr.trim().length > 0 ? selectionStr : '';

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

            <ApiDropdown
                apiUrl={question.apiUrl}
                initialData={selectionStr}
                onChange={(val) => {
                    if (inputRef.current) {
                        const inputValue =
                            val && val.trim().length > 0 ? val : '';
                        inputRef.current.value = inputValue;
                        const message =
                            (question.required ?? false) &&
                            !disabled &&
                            (!val || val.trim().length === 0)
                                ? getErrorMessage()
                                : '';
                        inputRef.current.setCustomValidity(message);
                        if (!message) {
                            setIsInvalid(false);
                        }
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
                required={(question.required ?? false) && !disabled}
                readOnly={disabled}
                placeholder={question.placeHolder || question.title}
                isInvalid={isInvalid}
            />
        </div>
    );
}
