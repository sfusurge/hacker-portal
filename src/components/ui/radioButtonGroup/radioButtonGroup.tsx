'use client';

import { useEffect, useMemo, useState } from 'react';
import { FormTextInput } from '../input/input';
import style from './radioButtonGroup.module.css';

export interface RadioButtonGroupProps {
    options: { data: string; name: string }[];
    allowDeselect?: boolean;
    allowCustomInput?: boolean;
    required?: boolean;
    onSelection?: (data: string | undefined) => void;
    defaultSelection?: string;
    name: string;
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
}: RadioButtonGroupProps) {
    const [selection, _setSelection] = useState<string | undefined>(
        defaultSelection
    );

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
        console.log(`Setting selection for ${name} to:`, val);
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
        <fieldset className={style.optionsContainer}>
            {options.map((item, index) => {
                // Create a unique ID for each radio input
                const inputId = `${name}-${item.data.replace(/\s+/g, '-')}-${index}`;

                return (
                    <label
                        key={index}
                        htmlFor={inputId}
                        className={style.optionLabel}
                    >
                        <input
                            type="radio"
                            id={inputId}
                            name={name}
                            value={item.data}
                            required={required}
                            checked={item.data === selection}
                            onChange={() => {
                                setSelection(item.data);
                            }}
                            className={style.radio}
                            onClick={(e) => {
                                // Prevent the default radio behavior to handle deselection manually
                                if (allowDeselect && item.data === selection) {
                                    e.preventDefault();
                                    clearSelection(item.data);
                                }
                            }}
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
                        className={style.optionLabel}
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
                                setSelection('');
                            }}
                            className={style.radio}
                        />
                        Other
                        {
                            // Custom input field
                            allowCustomInput && usingCustomInput && (
                                <FormTextInput
                                    type="text"
                                    lazy
                                    onLazyChange={(val) => {
                                        setSelection(val as string);
                                    }}
                                    placeholder="Please specify"
                                    errorMsg="Required!"
                                    required={required}
                                    style={{
                                        flexBasis: '100%',
                                        marginLeft: '1.75rem',
                                    }}
                                    defaultValue={selection}
                                    hideBackground
                                />
                            )
                        }
                    </label>
                )
            }
        </fieldset>
    );
}
