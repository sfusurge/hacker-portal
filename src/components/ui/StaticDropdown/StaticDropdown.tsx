'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { ChevronsUpDown, Plus } from 'lucide-react';
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
    initialData?: string;
    onChange: (val: string) => void;
    required?: boolean;
    readOnly?: boolean;
    placeholder?: string;
    isInvalid?: boolean;
    allowCustom?: boolean;
    customPlaceHolder?: string;
    description?: string;
};

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
}: StaticDropdownProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [customValue, setCustomValue] = useState('');
    const [isOtherSelected, setIsOtherSelected] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string>(() => {
        return typeof initialData === 'string' && initialData
            ? initialData
            : '';
    });
    const [selectedObject, setSelectedObject] =
        useState<StaticDropdownOption | null>(null);
    const isManualSwitchToOther = useRef(false);

    useEffect(() => {
        if (initialData !== undefined && initialData !== selectedValue) {
            setSelectedValue(initialData);
            if (initialData) {
                const found = staticChoices.find(
                    (opt) => opt.value === initialData
                );
                setSelectedObject(found || null);
            } else {
                setSelectedObject(null);
            }
        } else if (
            initialData !== undefined &&
            initialData === selectedValue &&
            selectedObject
        ) {
            const found = staticChoices.find(
                (opt) => opt.value === initialData
            );
            if (found && found.name !== selectedObject.name) {
                setSelectedObject(found);
            }
        }
    }, [initialData, staticChoices]);

    useEffect(() => {
        if (allowCustom) {
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
        } else {
            setIsOtherSelected(false);
        }
    }, [allowCustom, selectedValue, staticChoices]);

    const handleToggle = (option: StaticDropdownOption) => {
        setIsOtherSelected(false);
        setSelectedValue(option.value);
        setSelectedObject(option);
        onChange(option.value);
        setOpen(false);
    };

    const handleAddCustom = () => {
        const customVal = searchQuery.trim();
        if (!customVal) return;

        setCustomValue(customVal);
        setSelectedValue(customVal);
        setSelectedObject(null);
        onChange(customVal);
        setOpen(false);
    };

    const handleCustomInputChange = (value: string) => {
        setCustomValue(value);
        setSelectedValue(value);
        onChange(value);
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
        if (!selectedValue) return placeholder;
        return selectedObject ? selectedObject.name : selectedValue;
    };

    const isSelected = (value: string) => {
        return selectedValue === value;
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
        <Collapsible
            open={open}
            onOpenChange={(newOpen) => {
                setOpen(newOpen);
                if (newOpen) {
                    setSearchQuery('');
                }
            }}
            className="w-full max-w-[480px]"
        >
            <CollapsibleTrigger asChild>
                <button
                    type="button"
                    data-validation-control
                    disabled={readOnly}
                    className={cn(
                        'flex items-center justify-between gap-2',
                        'min-h-[44px] w-full',
                        'rounded-lg border',
                        'bg-neutral-800/60 backdrop-blur',
                        'px-4 py-2',
                        'text-base font-medium text-white',
                        'focus:ring-brand-500/50 focus:ring-2 focus:outline-none',
                        'transition-colors',
                        readOnly && 'cursor-not-allowed opacity-50',
                        isInvalid
                            ? 'border-[var(--danger-500)]'
                            : 'border-neutral-700/60'
                    )}
                >
                    <span className="min-w-0 flex-1 truncate text-left text-wrap">
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
                                        handleAddCustom();
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
                            !selectedValue && (
                                <div className="px-3 py-3 text-center text-sm text-neutral-400">
                                    No results found
                                </div>
                            )}

                        {searchResults.map((option, idx) => {
                            const selected = isSelected(option.value);
                            return (
                                <label
                                    key={`option-${option.value}-${idx}-${option.name}`}
                                    className={containerClass(selected)}
                                >
                                    <input
                                        type="radio"
                                        checked={selected}
                                        onChange={() => handleToggle(option)}
                                        className="sr-only"
                                    />
                                    <div
                                        className={radioCircleClass(selected)}
                                    />
                                    <span className="text-base font-normal text-white">
                                        {option.name}
                                    </span>
                                </label>
                            );
                        })}

                        {searchQuery.trim() &&
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

                        {allowCustom && (
                            <div className="flex flex-col">
                                <label
                                    className={cn(
                                        containerClass(isOtherSelected),
                                        'pb-0'
                                    )}
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
                                    <span className="text-base font-normal text-white">
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
