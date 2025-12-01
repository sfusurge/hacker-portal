'use client';

import { type PrimitiveAtom, useAtom, useAtomValue, WritableAtom } from 'jotai';
import type { QuestionDropdown } from '../types';
import { FormTextInput } from '@/components/ui/input/input';
import { useState, useEffect, useRef } from 'react';
import {
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent,
} from '@/components/ui/collapsible';
import { ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { finalErrCheckAtom } from '../InputForm';

export function DropdownInput({
    dataAtom,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionDropdown>
        | WritableAtom<QuestionDropdown, [QuestionDropdown], void>;
}) {
    const [question, setQuestion] = useAtom(dataAtom);
    const [customValue, setCustomValue] = useState('');
    const [open, setOpen] = useState(false);
    const [isOtherSelected, setIsOtherSelected] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isInvalid, setIsInvalid] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const isManualSwitchToOther = useRef(false);
    const showErrors = useAtomValue(finalErrCheckAtom);

    const selectedValue = question.value;

    useEffect(() => {
        if (!inputRef.current) return;

        let message = '';

        if (question.required && showErrors) {
            if (
                typeof selectedValue !== 'string' ||
                selectedValue.trim().length === 0
            ) {
                message = 'Required, please select an option';
            } else if (
                question.allowCustom &&
                isOtherSelected &&
                (!customValue || customValue.trim().length === 0) &&
                question.required
            ) {
                message = 'Required, please specify your custom option';
            }
        }

        inputRef.current.setCustomValidity(message);
        setErrorMsg(message);
        setIsInvalid(message !== '');
    }, [
        selectedValue,
        question.required,
        question.allowCustom,
        isOtherSelected,
        customValue,
        showErrors,
    ]);

    const getDisplayText = (): string => {
        if (!selectedValue) {
            return (
                question.placeHoldder ||
                question.description ||
                'Select an option'
            );
        }

        if (typeof selectedValue === 'string') {
            if (selectedValue === '') {
                return (
                    question.placeHoldder ||
                    question.description ||
                    'Select an option'
                );
            }
            const selectedChoice = question.choices.find(
                (choice) => choice.data === selectedValue
            );
            if (selectedChoice) return selectedChoice.name;
            return selectedValue;
        }

        return (
            question.placeHoldder || question.description || 'Select an option'
        );
    };

    useEffect(() => {
        if (question.allowCustom) {
            if (isManualSwitchToOther.current) {
                isManualSwitchToOther.current = false;
                return;
            }

            const isPredefinedChoice = question.choices.some(
                (choice) => choice.data === selectedValue
            );

            if (isPredefinedChoice) {
                setIsOtherSelected(false);
            } else if (
                typeof selectedValue === 'string' &&
                selectedValue.length > 0
            ) {
                setIsOtherSelected(true);
                setCustomValue(selectedValue);
            }
        } else {
            setIsOtherSelected(false);
        }
    }, [question.allowCustom, selectedValue, question.choices]);

    const handleSelectChange = (value: string) => {
        setIsOtherSelected(false);
        setQuestion({
            ...question,
            value,
        });
    };

    const handleCustomInputChange = (value: string) => {
        setCustomValue(value);
        setQuestion({ ...question, value });
    };

    const isSelected = (choiceData: string) => {
        return (
            typeof selectedValue === 'string' && selectedValue === choiceData
        );
    };

    const radioCircleClass = (checked: boolean) =>
        cn(
            'size-5 rounded-full box-border',
            'transition-all duration-[400ms] ease-out',
            checked
                ? 'border-[6px] border-brand-500 bg-white'
                : 'border border-neutral-600 bg-transparent'
        );

    const containerClass = (checked: boolean) =>
        cn(
            'flex items-center gap-3 px-3 py-3',
            'cursor-pointer',
            'transition-colors duration-[400ms] ease-out',
            'min-h-[48px]'
        );

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
            <div className="relative">
                <Collapsible
                    open={open}
                    onOpenChange={setOpen}
                    className="w-full max-w-[480px]"
                >
                    <CollapsibleTrigger asChild>
                        <button
                            type="button"
                            className={cn(
                                'flex items-center justify-between gap-2',
                                'min-h-[44px] w-full',
                                'rounded-lg border',
                                'bg-neutral-800/60 backdrop-blur',
                                'px-4 py-2',
                                'text-base font-medium text-white',
                                'hover:border-neutral-600',
                                'focus:ring-brand-500/50 focus:ring-2 focus:outline-none',
                                'transition-colors',
                                isInvalid
                                    ? 'border-danger-400'
                                    : 'border-neutral-700/60'
                            )}
                        >
                            <span className="flex-1 text-left">
                                {getDisplayText()}
                            </span>
                            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                        </button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="mt-2">
                        <div
                            className={cn(
                                'bg-neutral-800/60 p-1 backdrop-blur',
                                'rounded-lg border border-neutral-700/30',
                                'w-full max-w-[480px]'
                            )}
                        >
                            <div className="flex flex-col gap-1">
                                {(question.dropdownDescription ||
                                    question.description) && (
                                    <div className="px-2 py-2 pb-1">
                                        <p className="text-xs font-medium tracking-wide text-neutral-400 uppercase">
                                            {question.dropdownDescription ||
                                                question.description}
                                        </p>
                                    </div>
                                )}

                                {question.choices.map((choice) => {
                                    const selected = isSelected(choice.data);
                                    return (
                                        <label
                                            key={choice.data}
                                            className={containerClass(selected)}
                                        >
                                            <input
                                                type="radio"
                                                name={`dropdown-${question.questionId}`}
                                                checked={selected}
                                                onChange={() =>
                                                    handleSelectChange(
                                                        choice.data
                                                    )
                                                }
                                                className="sr-only"
                                            />
                                            <div
                                                className={radioCircleClass(
                                                    selected
                                                )}
                                            />

                                            <span className="text-base font-normal text-white">
                                                {choice.name}
                                            </span>
                                        </label>
                                    );
                                })}

                                {question.allowCustom && (
                                    <div className="flex flex-col">
                                        <label
                                            className={cn(
                                                containerClass(isOtherSelected),
                                                'pb-0'
                                            )}
                                            onClick={(e) => {
                                                if (
                                                    e.target instanceof
                                                    HTMLInputElement
                                                )
                                                    return;
                                                isManualSwitchToOther.current =
                                                    true;
                                                setIsOtherSelected(true);
                                                setQuestion({
                                                    ...question,
                                                    value: customValue,
                                                });
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name={`dropdown-${question.questionId}`}
                                                checked={isOtherSelected}
                                                onChange={() => {
                                                    isManualSwitchToOther.current =
                                                        true;
                                                    setIsOtherSelected(true);
                                                    setQuestion({
                                                        ...question,
                                                        value: customValue,
                                                    });
                                                }}
                                                className="sr-only"
                                            />
                                            <div
                                                className={radioCircleClass(
                                                    isOtherSelected
                                                )}
                                            />
                                            <span className="text-base font-normal text-white">
                                                Other
                                            </span>
                                        </label>
                                        <FormTextInput
                                            type="text"
                                            lazy
                                            timeOut={500}
                                            onLazyChange={
                                                handleCustomInputChange
                                            }
                                            defaultValue={customValue}
                                            placeholder={
                                                question.customPlaceHolder ||
                                                'Please Specify'
                                            }
                                            required={
                                                question.required &&
                                                isOtherSelected
                                            }
                                            style={{ width: '100%' }}
                                            hideBackground
                                            className="mr-3 mb-3 ml-11 overflow-hidden pt-0 pb-0 transition-all duration-300 ease-out placeholder:!text-white/60"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>
        </div>
    );
}
