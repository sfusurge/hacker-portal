'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { CheckBoxWithLabel } from '../checkbox/checkboxWithLabel';
import style from './CheckBoxGroup.module.css';
import { FormTextInput } from '../input/input';

interface CheckBoxGroupProps {
    id: string | number;
    min?: number;
    max?: number;
    choices: {
        name: string;
        data: string;
        value?: boolean;
        exclusive?: boolean;
    }[];
    selected?: string[];
    onSelection: (selected: Set<string>, other: string | undefined) => void;
    allowOther?: boolean;
    otherValue?: string | undefined;
    required?: boolean;
}

export function CheckboxGroup({
    id,
    min = 0,
    max = 1,
    choices,
    selected: initialSelected = [],
    allowOther = false,
    otherValue,
    onSelection,
    required,
}: CheckBoxGroupProps) {
    const selectedItems = new Set(initialSelected);
    const [usingOther, setUsingOther] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [touched, setTouched] = useState<boolean>(false);

    useEffect(() => {
        if (allowOther) {
            setUsingOther(otherValue !== undefined && !!otherValue.trim());
        }
    }, [allowOther, otherValue]);

    // update error message
    useEffect(() => {
        if (!inputRef.current) return;

        let message = '';
        const cleanedOtherValue = otherValue ? otherValue.trim() : '';

        if (usingOther && cleanedOtherValue.length === 0) {
            message = "Please fill the 'Other' value.";
        }

        if (required && !message && touched) {
            const count = selectedItems.size + (usingOther ? 1 : 0);

            if (count > max) message = `Too many selections! Max: ${max}`;

            if (count < min) message = `Too few selections! Min: ${min}`;
        }

        inputRef.current.setCustomValidity(message);
        setErrorMsg(message);
    }, [
        max,
        min,
        otherValue,
        required,
        selectedItems.size,
        usingOther,
        touched,
    ]);

    const handleCheckboxChange = (
        item: string,
        checked: boolean,
        exclusive: boolean
    ) => {
        setTouched(true);
        let newSelected = new Set(exclusive ? [] : selectedItems);

        if (checked) {
            newSelected.add(item);
        } else {
            newSelected.delete(item);
        }

        onSelection(newSelected, usingOther ? otherValue : undefined);
    };

    return (
        <fieldset
            style={
                {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    '--errorMsg': `"${errorMsg}"`,
                } as CSSProperties
            }
            className={style.checkboxgroupfield}
        >
            <input
                ref={inputRef}
                type="text"
                style={{ display: 'none' }}
                required={required}
                defaultValue="na"
            />

            {choices.map((item, index) => (
                <CheckBoxWithLabel
                    checked={selectedItems.has(item.data)}
                    name={item.name}
                    key={index}
                    onChange={(e) =>
                        handleCheckboxChange(
                            item.data,
                            e.target.checked,
                            item.exclusive ?? false
                        )
                    }
                    disabled={
                        selectedItems.size >= max &&
                        !selectedItems.has(item.data)
                    }
                    required={false}
                />
            ))}

            {allowOther && (
                <CheckBoxWithLabel
                    checked={usingOther}
                    name="Other"
                    key="other"
                    onChange={(e) => {
                        setUsingOther(e.target.checked);
                        onSelection(
                            selectedItems,
                            e.target.checked ? otherValue : undefined
                        );
                    }}
                    required={false}
                    id={`Other${id}`}
                    className="w-full"
                >
                    <FormTextInput
                        type="text"
                        lazy
                        timeOut={300}
                        onLazyChange={(val) => {
                            onSelection(selectedItems, val);
                        }}
                        defaultValue={otherValue}
                        required={required && usingOther}
                        placeholder="Please specify"
                        hideBackground
                        className="w-full placeholder:!text-white/60"
                    />
                </CheckBoxWithLabel>
            )}
        </fieldset>
    );
}
