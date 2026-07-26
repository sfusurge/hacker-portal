'use client';

import { type PrimitiveAtom, useAtom, useAtomValue, WritableAtom } from 'jotai';
import type { QuestionDropdown } from '../types';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { finalErrCheckAtom } from '../InputForm';
import { StaticDropdown } from '@/components/ui/StaticDropdown/StaticDropdown';

function hasDropdownSelection(
    value: QuestionDropdown['value'],
    allowMultiple?: boolean
): boolean {
    if (allowMultiple) {
        return Array.isArray(value) && value.length > 0;
    }
    return typeof value === 'string' && value.trim().length > 0;
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
    const showErrors = useAtomValue(finalErrCheckAtom);
    const allowMultiple = question.allowMultiple ?? false;

    useEffect(() => {
        if (!inputRef.current) return;

        let message = '';

        if (question.required && showErrors) {
            if (!hasDropdownSelection(question.value, allowMultiple)) {
                message = allowMultiple
                    ? 'Required, please select at least one option'
                    : 'Required, please select an option';
            }
        }

        inputRef.current.setCustomValidity(message);
        setErrorMsg(message);
        setIsInvalid(message !== '');
    }, [question.value, question.required, showErrors, allowMultiple]);

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
            <StaticDropdown
                staticChoices={staticChoices}
                initialData={initialData}
                onChange={(val) => {
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
