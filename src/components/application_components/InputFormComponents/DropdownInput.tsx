'use client';

import { type PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import type { QuestionDropdown } from '../types';
import { FormTextInput } from '@/components/ui/input/input';
import { useState, useEffect } from 'react';
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover';
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DropdownInput({
    dataAtom,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionDropdown>
        | WritableAtom<QuestionDropdown, [QuestionDropdown], void>;
}) {
    const [question, setQuestion] = useAtom(dataAtom);
    const [customValue, setCustomValue] = useState<string>('');
    const [open, setOpen] = useState(false);
    const [isOtherSelected, setIsOtherSelected] = useState(false);

    const allowMultiple = question.allowMultiple ?? false;
    const selectedValue = question.value;

    // Get display text for the button
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
            if (selectedChoice) {
                return selectedChoice.name;
            }
            // It's a custom value
            return selectedValue;
        }

        // Array case for multiple selection
        if (Array.isArray(selectedValue) && selectedValue.length > 0) {
            return `${selectedValue.length} selected`;
        }

        return (
            question.placeHoldder || question.description || 'Select an option'
        );
    };

    // Check if custom value is selected
    useEffect(() => {
        if (question.allowCustom && selectedValue) {
            if (typeof selectedValue === 'string') {
                const isCustom =
                    !question.choices.some(
                        (choice) => choice.data === selectedValue
                    ) && selectedValue !== '';
                setIsOtherSelected(isCustom);
                if (isCustom) {
                    setCustomValue(selectedValue);
                }
            } else {
                setIsOtherSelected(false);
            }
        } else {
            setIsOtherSelected(false);
        }
    }, [question.allowCustom, selectedValue, question.choices]);

    const handleSelectChange = (value: string) => {
        if (allowMultiple) {
            const currentValues = Array.isArray(selectedValue)
                ? selectedValue
                : selectedValue
                  ? [selectedValue]
                  : [];
            if (currentValues.includes(value)) {
                // Remove if already selected
                setQuestion({
                    ...question,
                    value: currentValues.filter((v) => v !== value),
                });
            } else {
                // Add to selection
                setQuestion({
                    ...question,
                    value: [...currentValues, value],
                });
            }
        } else {
            setQuestion({ ...question, value });
            setOpen(false); // Close popover after selection
        }
    };

    const handleOtherSelect = () => {
        setIsOtherSelected(true);
        setQuestion({ ...question, value: '' });
    };

    const handleCustomInputChange = (value: string) => {
        setCustomValue(value);
        setQuestion({ ...question, value });
    };

    const isSelected = (choiceData: string) => {
        if (allowMultiple) {
            return (
                Array.isArray(selectedValue) &&
                selectedValue.includes(choiceData)
            );
        }
        return (
            typeof selectedValue === 'string' && selectedValue === choiceData
        );
    };

    // For multiple selection, we'll show a different UI (keep existing button-based UI)
    if (allowMultiple) {
        return (
            <div className="space-y-2" style={{ maxWidth: '480px' }}>
                <div className="flex flex-wrap gap-2">
                    {question.choices.map((choice) => {
                        const selected = isSelected(choice.data);
                        return (
                            <button
                                key={choice.data}
                                type="button"
                                onClick={() => handleSelectChange(choice.data)}
                                className={cn(
                                    'rounded-md border px-3 py-1.5 text-sm transition-colors',
                                    selected
                                        ? 'bg-brand-900 border-brand-500 text-white'
                                        : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-600'
                                )}
                            >
                                {choice.name}
                            </button>
                        );
                    })}
                </div>
                {question.allowCustom && (
                    <div className="space-y-2">
                        {isOtherSelected ? (
                            <FormTextInput
                                type="text"
                                lazy
                                timeOut={500}
                                onLazyChange={handleCustomInputChange}
                                defaultValue={customValue}
                                placeholder={question.customPlaceHolder ?? ''}
                                required={question.required && !selectedValue}
                                style={{ maxWidth: '480px' }}
                            />
                        ) : (
                            <button
                                type="button"
                                onClick={handleOtherSelect}
                                className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-300 hover:border-neutral-600"
                            >
                                + Add Custom
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Single selection dropdown - new design matching Figma
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        'flex items-center justify-between gap-2',
                        'min-h-[44px] w-full',
                        'rounded-lg border border-neutral-700/60',
                        'bg-neutral-800/60 backdrop-blur',
                        'px-4 py-2',
                        'text-base font-medium text-white',
                        'hover:border-neutral-600',
                        'focus:ring-brand-500/50 focus:ring-2 focus:outline-none',
                        'transition-colors'
                    )}
                    style={{ maxWidth: '480px' }}
                >
                    <span className="flex-1 text-left">{getDisplayText()}</span>
                    <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                className={cn(
                    'w-full p-1',
                    'bg-neutral-800/60 backdrop-blur',
                    'border border-neutral-700/30',
                    'rounded-lg',
                    'max-w-[480px]'
                )}
                align="start"
                sideOffset={4}
            >
                <div className="flex flex-col gap-1">
                    {/* Header */}
                    {(question.dropdownDescription || question.description) && (
                        <div className="px-2 py-2 pb-1">
                            <p className="text-xs font-medium tracking-wide text-neutral-400 uppercase">
                                {question.dropdownDescription ||
                                    question.description}
                            </p>
                        </div>
                    )}

                    {/* Radio options */}
                    {question.choices.map((choice) => {
                        const selected = isSelected(choice.data);
                        return (
                            <label
                                key={choice.data}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-3',
                                    'cursor-pointer rounded-lg',
                                    'transition-colors',
                                    'hover:bg-neutral-700/30'
                                )}
                            >
                                <div className="relative flex shrink-0 items-center justify-center">
                                    <input
                                        type="radio"
                                        name={`dropdown-${question.questionId}`}
                                        checked={selected}
                                        onChange={() =>
                                            handleSelectChange(choice.data)
                                        }
                                        className="sr-only"
                                    />
                                    <div
                                        className={cn(
                                            'size-5 rounded-full border-2',
                                            'flex items-center justify-center',
                                            'transition-colors',
                                            selected
                                                ? 'border-brand-500'
                                                : 'border-neutral-600'
                                        )}
                                    >
                                        {selected && (
                                            <div className="bg-brand-500 size-2.5 rounded-full" />
                                        )}
                                    </div>
                                </div>
                                <span className="text-base font-normal text-white">
                                    {choice.name}
                                </span>
                            </label>
                        );
                    })}

                    {/* Other option with custom input */}
                    {question.allowCustom && (
                        <div className="flex flex-col gap-0.5">
                            <label
                                className={cn(
                                    'flex items-center gap-3 px-3 py-3',
                                    'cursor-pointer rounded-lg',
                                    'transition-colors',
                                    'hover:bg-neutral-700/30'
                                )}
                            >
                                <div className="relative flex shrink-0 items-center justify-center">
                                    <input
                                        type="radio"
                                        name={`dropdown-${question.questionId}`}
                                        checked={isOtherSelected}
                                        onChange={handleOtherSelect}
                                        className="sr-only"
                                    />
                                    <div
                                        className={cn(
                                            'size-5 rounded-full border-2',
                                            'flex items-center justify-center',
                                            'transition-colors',
                                            isOtherSelected
                                                ? 'border-brand-500'
                                                : 'border-neutral-600'
                                        )}
                                    >
                                        {isOtherSelected && (
                                            <Check className="text-brand-500 size-3" />
                                        )}
                                    </div>
                                </div>
                                <span className="text-base font-normal text-white">
                                    Other
                                </span>
                            </label>

                            {/* Custom input field */}
                            {isOtherSelected && (
                                <div className="pr-3 pb-3 pl-11">
                                    <FormTextInput
                                        type="text"
                                        lazy
                                        timeOut={500}
                                        onLazyChange={handleCustomInputChange}
                                        defaultValue={customValue}
                                        placeholder={
                                            question.customPlaceHolder ||
                                            'Please Specify'
                                        }
                                        required={question.required}
                                        style={{ width: '100%' }}
                                        hideBackground
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
