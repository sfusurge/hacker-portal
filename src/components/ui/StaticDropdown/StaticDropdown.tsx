'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormTextInput } from '@/components/ui/input/input';
import {
    ComboboxCheckboxIndicator,
    ComboboxEmptyState,
    ComboboxOptionRow,
    ComboboxRadioIndicator,
    ComboboxSearchInput,
    ComboboxShell,
    comboboxNativeControlClass,
} from '@/components/ui/combobox/ComboboxShared';

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
    initialData: string | string[] | undefined
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
        normalizeInitialValues(initialData)
    );
    const isManualSwitchToOther = useRef(false);

    const selectedValue = selectedValues[0] ?? '';
    const showSearch = staticChoices.length > 10;

    useEffect(() => {
        const next = normalizeInitialValues(initialData);
        setSelectedValues((prev) => {
            if (
                prev.length === next.length &&
                prev.every((value, index) => value === next[index])
            ) {
                return prev;
            }
            return next;
        });
    }, [initialData]);

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
        } else {
            setIsOtherSelected(false);
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

        // Allow deselecting a single-select option by clicking it again
        if (selectedValues.includes(option.value) && !isOtherSelected) {
            setSelectedValues([]);
            emitChange([]);
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
        setIsOtherSelected(true);
        setSelectedValues([customVal]);
        emitChange([customVal]);
        setSearchQuery('');
        setOpen(false);
    };

    const handleCustomInputChange = (value: string) => {
        setCustomValue(value);
        setSelectedValues(value ? [value] : []);
        emitChange(value ? [value] : []);
    };

    const selectOther = () => {
        isManualSwitchToOther.current = true;
        setIsOtherSelected(true);
        setSelectedValues(customValue ? [customValue] : []);
        emitChange(customValue ? [customValue] : []);
        // Keep the menu open so the nested "Please Specify" field stays visible
    };

    const clearSelection = () => {
        setIsOtherSelected(false);
        setCustomValue('');
        setSelectedValues([]);
        emitChange([]);
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
        if (isOtherSelected) {
            return customValue.trim() || 'Other';
        }

        if (selectedValues.length === 0) return placeholder;

        if (allowMultiple && selectedValues.length > 1) {
            return `Multiple Selected (${selectedValues.length})`;
        }

        const value = selectedValues[0];
        const found = staticChoices.find((opt) => opt.value === value);
        return found ? found.name : value;
    };

    const isSelected = (value: string) => selectedValues.includes(value);
    const hasValue = selectedValues.length > 0 || isOtherSelected;

    const canAddFromSearch =
        allowCustom &&
        searchQuery.trim() &&
        !staticChoices.find(
            (o) => o.name.toLowerCase() === searchQuery.trim().toLowerCase()
        );

    return (
        <ComboboxShell
            open={open}
            onOpenChange={(newOpen) => {
                setOpen(newOpen);
                if (newOpen) setSearchQuery('');
            }}
            displayText={getDisplayText()}
            placeholder={placeholder}
            readOnly={readOnly}
            isInvalid={isInvalid}
            hasValue={hasValue}
            onClear={clearSelection}
            header={
                <>
                    {showSearch && (
                        <ComboboxSearchInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            onEnter={() => {
                                if (allowCustom) handleAddCustom();
                            }}
                            autoFocus
                        />
                    )}
                    {description && (
                        <div className="w-full px-2 pt-2 pb-1">
                            <p className="font-mono text-xs leading-tight font-medium text-[var(--text-secondary)] uppercase">
                                {description}
                            </p>
                        </div>
                    )}
                </>
            }
        >
            <div className="flex flex-col gap-1">
                {searchResults.length === 0 && (
                    <ComboboxEmptyState>
                        {searchQuery.trim()
                            ? 'No results found'
                            : 'No options available'}
                    </ComboboxEmptyState>
                )}

                {searchResults.map((option, idx) => {
                    const selected =
                        isSelected(option.value) && !isOtherSelected;
                    return (
                        <ComboboxOptionRow
                            key={`option-${option.value}-${idx}-${option.name}`}
                            selected={selected}
                        >
                            <input
                                type={allowMultiple ? 'checkbox' : 'radio'}
                                checked={selected}
                                onChange={() => handleToggle(option)}
                                className={comboboxNativeControlClass}
                            />
                            {allowMultiple ? (
                                <ComboboxCheckboxIndicator checked={selected} />
                            ) : (
                                <ComboboxRadioIndicator checked={selected} />
                            )}
                            <span className="max-w-full min-w-0 flex-1 text-base font-normal text-pretty break-words text-white">
                                {option.name}
                            </span>
                        </ComboboxOptionRow>
                    );
                })}

                {canAddFromSearch && (
                    <button
                        type="button"
                        onClick={handleAddCustom}
                        className="mt-1 flex w-full cursor-pointer items-center gap-3 rounded-lg border-t border-neutral-700 px-3 py-3 text-left transition-colors hover:bg-neutral-700/30"
                    >
                        <Plus className="size-4 shrink-0 text-neutral-400" />
                        <span className="min-w-0 flex-1 truncate text-base font-normal text-white">
                            Add &quot;{searchQuery.trim()}&quot;
                        </span>
                    </button>
                )}

                {allowCustom && !allowMultiple && (
                    <div
                        className={cn(
                            'flex flex-col gap-0.5 rounded-lg p-3',
                            isOtherSelected &&
                                'bg-[var(--background-brand-focus)]'
                        )}
                    >
                        <div className="relative flex items-center gap-3">
                            <input
                                type="radio"
                                checked={isOtherSelected}
                                onChange={selectOther}
                                onClick={(e) => {
                                    if (isOtherSelected) {
                                        e.preventDefault();
                                        clearSelection();
                                    }
                                }}
                                className={comboboxNativeControlClass}
                            />
                            <ComboboxRadioIndicator checked={isOtherSelected} />
                            <span className="max-w-full min-w-0 flex-1 text-base font-normal text-white">
                                Other
                            </span>
                        </div>
                        <div
                            className="relative z-20 flex h-8 w-full flex-col justify-center pl-8"
                            onPointerDown={(e) => e.stopPropagation()}
                        >
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
                                onFocus={selectOther}
                                className="h-8 overflow-hidden pt-0 pb-0 text-sm transition-all duration-300 ease-out placeholder:!text-[var(--text-secondary)]"
                            />
                        </div>
                    </div>
                )}
            </div>
        </ComboboxShell>
    );
}
