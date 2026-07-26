'use client';

import { type PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import type { QuestionDropdown } from '../types';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { StaticDropdown } from '@/components/ui/StaticDropdown/StaticDropdown';
import style from './DropdownInput.module.css';

export function DropdownInput({
    dataAtom,
    disabled = false,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionDropdown>
        | WritableAtom<QuestionDropdown, [QuestionDropdown], void>;
    disabled?: boolean;
}) {
    const [question, setQuestion] = useAtom(dataAtom);
    const [errorMsg, setErrorMsg] = useState('');
    const [isInvalid, setIsInvalid] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedValue =
        typeof question.value === 'string' ? question.value : '';

    useEffect(() => {
        if (!inputRef.current) return;

        let message = '';

        if ((question.required ?? false) && !disabled) {
            if (
                typeof selectedValue !== 'string' ||
                selectedValue.trim().length === 0
            ) {
                message = 'Required, please select an option';
            }
        }

        inputRef.current.setCustomValidity(message);
        setErrorMsg(message);
        if (!message) {
            setIsInvalid(false);
        }
    }, [disabled, selectedValue, question.required]);

    const staticChoices = question.choices.map((choice) => ({
        value: choice.data,
        name: choice.name,
    }));

    const inputValue =
        selectedValue && selectedValue.trim().length > 0 ? selectedValue : '';

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
            <StaticDropdown
                staticChoices={staticChoices}
                initialData={selectedValue}
                onChange={(val) => {
                    if (val?.trim()) setIsInvalid(false);
                    setQuestion({ ...question, value: val });
                }}
                required={(question.required ?? false) && !disabled}
                readOnly={disabled}
                placeholder={
                    question.placeHoldder ||
                    question.description ||
                    'Select an option'
                }
                isInvalid={isInvalid}
                allowCustom={question.allowCustom}
                customPlaceHolder={question.customPlaceHolder}
                description={
                    question.dropdownDescription || question.description
                }
            />
        </div>
    );
}
