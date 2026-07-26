'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { ChevronsUpDown, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { FormTextInput } from '@/components/ui/input/input';

export type StaticDropdownOption = {
    value: string;
    name: string;
};

type StaticDropdownProps = {
    staticChoices: StaticDropdownOption[];
    initialData?: string | string[];
    onChange: (val: string | string[]) => void;
    required?: boolean;
    readOnly?: boolean;
    placeholder?: string;
    isInvalid?: boolean;
    allowCustom?: boolean;
    customPlaceHolder?: string;
    description?: string;
    allowMultiple?: boolean;
};

function normalizeInitialValues(
    initialData: string | string[] | undefined,
    allowMultiple: boolean
): string[] {
    if (Array.isArray(initialData)) {
        return initialData.filter((v) => typeof v === 'string' && v.length > 0);
    }
    if (typeof initialData === 'string' && initialData.length > 0) {
        return [initialData];
    }
    return [];
}

export function StaticDropdown({
    staticChoices,
    initialData,
    onChange,
    required,
    readOnly,
    placeholder = 'Select an option',
    isInvalid = false,
    allowCustom = false,
    customPlaceHolder = 'Please Specify',
    description,
    allowMultiple = false,
}: StaticDropdownProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [customValue, setCustomValue] = useState('');
    const [isOtherSelected, setIsOtherSelected] = useState(false);
    const [selectedValues, setSelectedValues] = useState<string[]>(() =>
        normalizeInitialValues(initialData, allowMultiple)
    );
    const isManualSwitchToOther = useRef(false);

    const selectedValue = selectedValues[0] ?? '';

    useEffect(() => {
        const next = normalizeInitialValues(initialData, allowMultiple);
        setSelectedValues((prev) => {
            if (
                prev.length === next.length &&
                prev.every((value, index) => value === next[index])
            ) {
                return prev;
            }
            return next;
        });
    }, [initialData, allowMultiple]);

    useEffect(() => {
        if (allowMultiple || !allowCustom) {
            setIsOtherSelected(false);
            return;
        }

        if (isManualSwitchToOther.current) {
            isManualSwitchToOther.current = false;
            return;
        }

        const isPredefinedChoice = staticChoices.some(
            (choice) => choice.value === selectedValue
        );

        if (isPredefinedChoice) {
            setIsOtherSelected(false);
        } else if (selectedValue) {
            setIsOtherSelected(true);
            setCustomValue(selectedValue);
        }
    }, [allowCustom, allowMultiple, selectedValue, staticChoices]);

    const emitChange = (values: string[]) => {
        if (allowMultiple) {
            onChange(values);
            return;
        }
        onChange(values[0] ?? '');
    };

    const handleToggle = (option: StaticDropdownOption) => {
        setIsOtherSelected(false);

        if (allowMultiple) {
            const isSelected = selectedValues.includes(option.value);
            const next = isSelected
                ? selectedValues.filter((value) => value !== option.value)
                : [...selectedValues, option.value];
            setSelectedValues(next);
            emitChange(next);
            return;
        }

        setSelectedValues([option.value]);
        emitChange([option.value]);
        setOpen(false);
    };

    const handleAddCustom = () => {
        const customVal = searchQuery.trim();
        if (!customVal) return;

        if (allowMultiple) {
            if (selectedValues.includes(customVal)) {
                setSearchQuery('');
                return;
            }
            const next = [...selectedValues, customVal];
            setSelectedValues(next);
            emitChange(next);
            setSearchQuery('');
            return;
        }

        setCustomValue(customVal);
        setSelectedValues([customVal]);
        emitChange([customVal]);
        setOpen(false);
    };

    const handleCustomInputChange = (value: string) => {
        setCustomValue(value);
        setSelectedValues(value ? [value] : []);
        emitChange(value ? [value] : []);
    };

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return staticChoices;
        const query = searchQuery.toLowerCase();
        return staticChoices.filter(
            (opt) =>
                opt.name.toLowerCase().includes(query) ||
                opt.value.toLowerCase().includes(query)
        );
    }, [staticChoices, searchQuery]);

    const getDisplayText = () => {
        if (selectedValues.length === 0) return placeholder;

        if (allowMultiple && selectedValues.length > 1) {
            return `Multiple Selected (${selectedValues.length})`;
        }

        const value = selectedValues[0];
        const found = staticChoices.find((opt) => opt.value === value);
        return found ? found.name : value;
    };

    const isSelected = (value: string) => selectedValues.includes(value);

    const radioCircleClass = (checked: boolean) =>
        cn(
            'size-5 shrink-0 rounded-full box-border',
            'transition-all duration-[400ms] ease-out',
            checked
                ? 'border-[6px] border-brand-500 bg-white'
                : 'border border-neutral-600 bg-transparent'
        );

    const checkboxClass = (checked: boolean) =>
        cn(
            'flex size-5 min-w-5 shrink-0 items-center justify-center rounded border',
            'transition-colors duration-[400ms] ease-out',
            checked
                ? 'border-brand-500 bg-brand-500 text-white'
                : 'border-neutral-600 bg-transparent'
        );

    const containerClass = () =>
        cn(
            'flex w-full max-w-full min-w-0 items-center gap-3 px-3 py-3',
            'cursor-pointer',
            'transition-colors duration-[400ms] ease-out',
            'min-h-[48px]'
        );

    return (
        <Collapsible
            open={open}
            onOpenChange={(newOpen) => {
                setOpen(newOpen);
                if (newOpen) {
                    setSearchQuery('');
                }
            }}
            className="w-full max-w-[480px] min-w-0"
        >
            <CollapsibleTrigger asChild>
                <button
                    type="button"
                    disabled={readOnly}
                    className={cn(
                        'flex min-w-0 items-center justify-between gap-2',
                        'min-h-[44px] w-full max-w-full',
                        'rounded-lg border',
                        'bg-neutral-800/60 backdrop-blur',
                        'px-4 py-2',
                        'text-base font-medium text-white',
                        'focus:ring-brand-500/50 focus:ring-2 focus:outline-none',
                        'transition-colors',
                        readOnly && 'cursor-not-allowed opacity-50',
                        isInvalid
                            ? 'border-danger-400'
                            : 'border-neutral-700/60'
                    )}
                >
                    <span className="max-w-full min-w-0 flex-1 truncate text-left">
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
                        'max-h-120 w-full max-w-[480px] overflow-y-auto'
                    )}
                >
                    {staticChoices.length > 10 && (
                        <div className="px-2 py-2 pb-1">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (allowCustom) {
                                            handleAddCustom();
                                        }
                                    }
                                }}
                                className={cn(
                                    'w-full rounded px-3 py-2 text-sm',
                                    'border border-neutral-600/50 bg-neutral-700/40',
                                    'text-white placeholder:text-neutral-500',
                                    'focus:ring-brand-500/50 focus:ring-2 focus:outline-none'
                                )}
                            />
                        </div>
                    )}

                    {description && (
                        <div className="px-2 py-2 pb-1">
                            <p className="text-xs font-medium tracking-wide text-neutral-400 uppercase">
                                {description}
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col gap-1 px-1">
                        {searchResults.length === 0 &&
                            searchQuery.trim() === '' &&
                            selectedValues.length === 0 && (
                                <div className="px-3 py-3 text-center text-sm text-neutral-400">
                                    No results found
                                </div>
                            )}

                        {searchResults.map((option, idx) => {
                            const selected = isSelected(option.value);
                            return (
                                <label
                                    key={`option-${option.value}-${idx}-${option.name}`}
                                    className={containerClass()}
                                >
                                    <input
                                        type={
                                            allowMultiple ? 'checkbox' : 'radio'
                                        }
                                        checked={selected}
                                        onChange={() => handleToggle(option)}
                                        className="sr-only"
                                    />
                                    {allowMultiple ? (
                                        <div
                                            className={checkboxClass(selected)}
                                        >
                                            {selected && (
                                                <Check className="size-3.5" />
                                            )}
                                        </div>
                                    ) : (
                                        <div
                                            className={radioCircleClass(
                                                selected
                                            )}
                                        />
                                    )}
                                    <span className="max-w-full min-w-0 flex-1 text-base font-normal text-pretty break-words text-white">
                                        {option.name}
                                    </span>
                                </label>
                            );
                        })}

                        {allowCustom &&
                            searchQuery.trim() &&
                            !staticChoices.find(
                                (o) =>
                                    o.name.toLowerCase() ===
                                    searchQuery.trim().toLowerCase()
                            ) && (
                                <button
                                    onClick={handleAddCustom}
                                    className="mt-2 flex w-full cursor-pointer items-center gap-3 rounded-lg border-t border-neutral-700 px-3 py-3 pt-2 text-left transition-colors hover:bg-neutral-700/30"
                                >
                                    <Plus className="size-4 shrink-0 text-neutral-400" />
                                    <span className="min-w-0 flex-1 truncate text-base font-normal text-white">
                                        Add &quot;{searchQuery.trim()}&quot;
                                    </span>
                                </button>
                            )}

                        {allowCustom && !allowMultiple && (
                            <div className="flex flex-col">
                                <label
                                    className={cn(containerClass(), 'pb-0')}
                                    onClick={(e) => {
                                        if (
                                            e.target instanceof HTMLInputElement
                                        )
                                            return;
                                        isManualSwitchToOther.current = true;
                                        setIsOtherSelected(true);
                                        onChange(customValue);
                                    }}
                                >
                                    <input
                                        type="radio"
                                        checked={isOtherSelected}
                                        onChange={() => {
                                            isManualSwitchToOther.current =
                                                true;
                                            setIsOtherSelected(true);
                                            onChange(customValue);
                                        }}
                                        className="sr-only"
                                    />
                                    <div
                                        className={radioCircleClass(
                                            isOtherSelected
                                        )}
                                    />
                                    <span className="max-w-full min-w-0 flex-1 text-base font-normal text-white">
                                        Other
                                    </span>
                                </label>
                                <div className="mr-3 mb-3 ml-11">
                                    <FormTextInput
                                        type="text"
                                        lazy
                                        timeOut={500}
                                        onLazyChange={handleCustomInputChange}
                                        defaultValue={customValue}
                                        placeholder={customPlaceHolder}
                                        required={required && isOtherSelected}
                                        style={{ width: '100%' }}
                                        hideBackground
                                        className="overflow-hidden pt-0 pb-0 transition-all duration-300 ease-out placeholder:!text-white/60"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
