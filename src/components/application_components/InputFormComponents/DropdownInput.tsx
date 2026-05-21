'use client';

import { type PrimitiveAtom, useAtom, useAtomValue, WritableAtom } from 'jotai';
import type { QuestionDropdown } from '../types';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { finalErrCheckAtom } from '../InputForm';
import { StaticDropdown } from '@/components/ui/StaticDropdown/StaticDropdown';

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

    const selectedValue =
        typeof question.value === 'string' ? question.value : '';

    useEffect(() => {
        if (!inputRef.current) return;

        let message = '';

        if (question.required && showErrors) {
            if (
                typeof selectedValue !== 'string' ||
                selectedValue.trim().length === 0
            ) {
                message = 'Required, please select an option';
            }
        }

        inputRef.current.setCustomValidity(message);
        setErrorMsg(message);
        setIsInvalid(message !== '');
    }, [selectedValue, question.required, showErrors]);

    const staticChoices = question.choices.map((choice) => ({
        value: choice.data,
        name: choice.name,
    }));

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
                initialData={selectedValue}
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
                description={
                    question.dropdownDescription || question.description
                }
            />
        </div>
    );
}
