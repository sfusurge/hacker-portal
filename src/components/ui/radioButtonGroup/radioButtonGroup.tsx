'use client';

import { useEffect, useMemo, useState } from 'react';
import { FormTextInput } from '../input/input';
import style from './radioButtonGroup.module.css';
import { useAtomValue } from 'jotai';
import { finalErrCheckAtom } from '@/components/application_components/InputForm';
import clsx from 'clsx';

export interface RadioButtonGroupProps {
    options: { data: string; name: string }[];
    allowDeselect?: boolean;
    allowCustomInput?: boolean;
    required?: boolean;
    onSelection?: (data: string | undefined) => void;
    defaultSelection?: string;
    name: string;
    selectedValue?: string | null;
    disabled?: boolean;
}

/**
 * RadioButtonGroup component with improved handling for selections
 */
export function RadioButtonGroup({
    options,
    allowDeselect = false,
    allowCustomInput = false,
    required = false,
    defaultSelection = undefined,
    onSelection,
    name,
    selectedValue,
    disabled = false,
}: RadioButtonGroupProps) {
    const [selection, _setSelection] = useState<string | undefined>(
        selectedValue || defaultSelection
    );
    const finalcheck = useAtomValue(finalErrCheckAtom);

    const datas = useMemo(() => {
        const set = new Set<string | undefined>(
            options.map((item) => item.data)
        );
        set.add(undefined); // so that undefined is an "expected value"
        return set;
    }, [options]);

    const usingCustomInput = useMemo(
        () => selection !== undefined && !datas.has(selection),
        [selection, datas]
    );

    function clearSelection(val: string) {
        if (!allowDeselect) {
            return;
        }

        if (val === selection) {
            setSelection(undefined);
        }
    }

    function setSelection(val: string | undefined) {
        _setSelection(val);
        if (onSelection) {
            onSelection(val);
        }
    }

    // Update internal state when defaultSelection changes
    useEffect(() => {
        if (defaultSelection !== undefined) {
            _setSelection(defaultSelection);
        }
    }, [defaultSelection]);

    return (
        <fieldset
            className={clsx(
                style.optionsContainer,
                finalcheck && style.finalcheck
            )}
        >
            {options.map((item, index) => {
                // Create a unique ID for each radio input
                const inputId = `${name}-${item.data.replace(/\s+/g, '-')}-${index}`;
                const isSelected = item.data === selection;

                return (
                    <label
                        key={index}
                        htmlFor={inputId}
                        className={clsx(
                            style.optionLabel,
                            disabled && 'cursor-not-allowed opacity-50'
                        )}
                    >
                        <input
                            type="radio"
                            id={inputId}
                            name={name}
                            required={required}
                            checked={isSelected}
                            onChange={() => {
                                if (!disabled) {
                                    setSelection(item.data);
                                }
                            }}
                            className={style.radio}
                            onClick={(e) => {
                                if (disabled) {
                                    e.preventDefault();
                                    return;
                                }
                                if (allowDeselect && item.data === selection) {
                                    e.preventDefault();
                                    clearSelection(item.data);
                                }
                            }}
                            disabled={disabled}
                            readOnly={disabled}
                        />
                        {item.name}
                    </label>
                );
            })}
            {
                // Other - for custom input
                allowCustomInput && (
                    <label
                        htmlFor={`${name}-other`}
                        className={clsx(
                            style.optionLabel,
                            disabled && 'cursor-not-allowed opacity-50'
                        )}
                        style={{
                            flexFlow: 'wrap',
                        }}
                    >
                        <input
                            type="radio"
                            id={`${name}-other`}
                            name={name}
                            checked={usingCustomInput}
                            onChange={() => {
                                if (!disabled) {
                                    setSelection('');
                                }
                            }}
                            className={style.radio}
                            disabled={disabled}
                            readOnly={disabled}
                        />
                        Other
                        {
                            // Custom input field
                            allowCustomInput && (
                                <FormTextInput
                                    type="text"
                                    lazy
                                    timeOut={200}
                                    onLazyChange={(val) => {
                                        if (!disabled) {
                                            setSelection(val as string);
                                        }
                                    }}
                                    placeholder="Please specify"
                                    errorMsg="Required!"
                                    required={usingCustomInput && required}
                                    style={{
                                        flexBasis: '100%',
                                        marginLeft: '1.75rem',
                                    }}
                                    defaultValue={
                                        usingCustomInput ? selection : ''
                                    }
                                    hideBackground
                                    disabled={disabled}
                                    className="placeholder:!text-white/60"
                                />
                            )
                        }
                    </label>
                )
            }
        </fieldset>
    );
}
