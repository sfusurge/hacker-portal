'use client';

import {
    type CSSProperties,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { CheckBoxWithLabel } from '../checkbox/checkboxWithLabel';
import style from './CheckBoxGroup.module.css';
import { FormTextInput } from '../input/input';

interface CheckBoxGroupProps {
    min?: number;
    max?: number;
    choices: { name: string; data: string }[];
    selected?: string[];
    onSelection?: (selected: Set<string>, other: string | undefined) => void;
    allowOther?: boolean;
    otherValue?: string | undefined;
    required?: boolean;
    forceValidCheck?: boolean;
}

export function CheckboxGroup({
    min = 0,
    max = 1,
    choices,
    selected: initialSelected = [],
    allowOther = false,
    otherValue: defaultOther,
    onSelection,
    required,
    forceValidCheck = false,
}: CheckBoxGroupProps) {
    // Create a state for selected items instead of just a memoized value
    const [internalSelectedItems, setInternalSelectedItems] = useState<
        Set<string>
    >(new Set(initialSelected));
    const [otherValue, setOtherValue] = useState<string | undefined>(
        defaultOther
    );
    const [usingOther, setUsingOther] = useState(
        allowOther && defaultOther !== undefined
    );
    const ref = useRef<HTMLInputElement>(null);

    // Use a derived value that combines the prop and internal state
    const selectedItems = initialSelected
        ? new Set(initialSelected)
        : internalSelectedItems;

    const updateValidity = useCallback(() => {
        if (!ref.current || !required) {
            return;
        }

        if (usingOther && !otherValue) {
            ref.current!.setCustomValidity("Please fill the 'Other' value.");
        } else {
            const count =
                selectedItems.size + (otherValue && usingOther ? 1 : 0);

            if (count > max) {
                ref.current!.setCustomValidity(
                    `Too many selections! Max: ${max}`
                );
            } else if (count < min) {
                ref.current!.setCustomValidity(
                    `Too few selections! Min: ${min}`
                );
            } else {
                ref.current!.setCustomValidity('');
            }
        }
    }, [
        max,
        min,
        otherValue,
        required,
        selectedItems.size,
        usingOther,
        forceValidCheck,
    ]);

    const [initialized, setInitialized] = useState(false);
    // Trigger onSelection whenever relevant state changes
    useEffect(() => {
        if (initialized) {
            updateValidity();
        } else {
            setInitialized(true);
        }
    }, [updateValidity]);

    const handleCheckboxChange = (item: string, checked: boolean) => {
        // Create a new Set based on the current selectedItems
        const newSelected = new Set(selectedItems);

        if (checked) {
            newSelected.add(item);
        } else {
            newSelected.delete(item);
        }

        // Update internal state
        setInternalSelectedItems(newSelected);

        // Directly call onSelection with the new set
        onSelection &&
            onSelection(newSelected, usingOther ? otherValue : undefined);
    };

    return (
        <fieldset
            style={
                {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    '--errMsg': "'Invalid selections'",
                } as CSSProperties
            }
            className={style.checkboxgroupfield}
        >
            <input
                ref={ref}
                type="text"
                style={{ display: 'none' }}
                required={required}
                defaultValue={'na'}
            />
            {choices.map((item, index) => (
                <CheckBoxWithLabel
                    checked={selectedItems.has(item.data)}
                    name={item.name}
                    key={index}
                    onChange={(e) => {
                        handleCheckboxChange(item.data, e.target.checked);
                    }}
                    disabled={
                        selectedItems.size >= max &&
                        !selectedItems.has(item.data)
                    }
                    required={false}
                ></CheckBoxWithLabel>
            ))}

            {allowOther && (
                <CheckBoxWithLabel
                    checked={usingOther}
                    name="Other"
                    key="other"
                    onChange={(e) => {
                        setUsingOther(e.target.checked);
                    }}
                    required={false}
                >
                    {usingOther && (
                        <FormTextInput
                            type="text"
                            lazy
                            timeOut={300}
                            onLazyChange={(val) => {
                                setOtherValue(val);
                            }}
                            defaultValue={otherValue}
                            required={required && usingOther}
                            errorMsg="Required!"
                            placeholder="Please specify"
                            hideBackground
                        />
                    )}
                </CheckBoxWithLabel>
            )}
        </fieldset>
    );
}
