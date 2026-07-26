'use client';

import { type PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import type { QuestionDropdown } from '../types';
import { useState, useEffect, useRef } from 'react';
import { StaticDropdown } from '@/components/ui/StaticDropdown/StaticDropdown';
import style from './DropdownInput.module.css';

function hasDropdownSelection(
    value: QuestionDropdown['value'],
    allowMultiple?: boolean
): boolean {
    if (allowMultiple) {
        return Array.isArray(value) && value.length > 0;
    }
    return typeof value === 'string' && value.trim().length > 0;
}

function toInputValue(
    value: QuestionDropdown['value'],
    allowMultiple: boolean
): string {
    if (allowMultiple) {
        return Array.isArray(value) && value.length > 0 ? value.join(',') : '';
    }
    return typeof value === 'string' && value.trim().length > 0 ? value : '';
}

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
    const allowMultiple = question.allowMultiple ?? false;

    const inputValue = toInputValue(question.value, allowMultiple);

    useEffect(() => {
        if (!inputRef.current) return;

        let message = '';

        if ((question.required ?? false) && !disabled) {
            if (!hasDropdownSelection(question.value, allowMultiple)) {
                message = allowMultiple
                    ? 'Required, please select at least one option'
                    : 'Required, please select an option';
            }
        }

        inputRef.current.setCustomValidity(message);
        setErrorMsg(message);
        if (!message) {
            setIsInvalid(false);
        }
    }, [disabled, question.value, question.required, allowMultiple]);

    const staticChoices = question.choices.map((choice) => ({
        value: choice.data,
        name: choice.name,
    }));

    const initialData = allowMultiple
        ? Array.isArray(question.value)
            ? question.value
            : typeof question.value === 'string' && question.value
              ? [question.value]
              : []
        : typeof question.value === 'string'
          ? question.value
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
            <StaticDropdown
                staticChoices={staticChoices}
                initialData={initialData}
                onChange={(val) => {
                    if (hasDropdownSelection(val, allowMultiple)) {
                        setIsInvalid(false);
                    }
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
                allowMultiple={allowMultiple}
                description={
                    question.dropdownDescription || question.description
                }
            />
        </div>
    );
}
