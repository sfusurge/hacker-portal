'use client';

import {
    type CSSProperties,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
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
    onSelection?: (selected: Set<string>, other: string | undefined) => void;
    allowOther?: boolean;
    otherValue?: string | undefined;
    required?: boolean;
    forceValidCheck?: boolean;
}

export function CheckboxGroup({
    id,
    min = 0,
    max = 1,
    choices,
    selected: initialSelected = [],
    allowOther = false,
    otherValue: defaultOther = '',
    onSelection,
    required,
    forceValidCheck = false,
}: CheckBoxGroupProps) {
    const [internalSelectedItems, setInternalSelectedItems] = useState<
        Set<string>
    >(() => new Set(initialSelected));
    const [otherValue, setOtherValue] = useState<string | undefined>(
        defaultOther
    );
    // only show "Other" input if there's an otherValue that's not in the regular choices
    const [usingOther, setUsingOther] = useState(() => {
        if (!allowOther || !defaultOther || defaultOther.length === 0)
            return false;
        const regularChoices = choices.map((c) => c.data);
        return !regularChoices.includes(defaultOther);
    });
    const ref = useRef<HTMLInputElement>(null);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const onSelectionRef = useRef(onSelection);

    useEffect(() => {
        onSelectionRef.current = onSelection;
    }, [onSelection]);

    // sync to props when they change, but only if user hasn't interacted yet
    useEffect(() => {
        if (!hasUserInteracted) {
            setInternalSelectedItems(new Set(initialSelected));
            setOtherValue(defaultOther);
            // show "Other" input if there's an otherValue that's not in the regular choices
            if (!allowOther || !defaultOther || defaultOther.length === 0) {
                setUsingOther(false);
            } else {
                const regularChoices = choices.map((c) => c.data);
                setUsingOther(!regularChoices.includes(defaultOther));
            }
        }
    }, [initialSelected, defaultOther, allowOther, hasUserInteracted, choices]);

    // call onSelection after user interaction, not on initial load
    useEffect(() => {
        if (hasUserInteracted && onSelectionRef.current) {
            onSelectionRef.current(internalSelectedItems, otherValue);
        }
    }, [usingOther, otherValue, internalSelectedItems, hasUserInteracted]);

    const selectedItems = internalSelectedItems;

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
    }, [max, min, otherValue, required, selectedItems.size, usingOther]);

    const [initialized, setInitialized] = useState(false);
    // trigger onSelection whenever relevant state changes
    useEffect(() => {
        if (initialized) {
            updateValidity();
        } else {
            setInitialized(true);
        }
    }, [updateValidity, initialized]);

    const handleCheckboxChange = (
        item: string,
        checked: boolean,
        exclusive: boolean = false
    ) => {
        setHasUserInteracted(true);

        if (!checked) {
            exclusive = false; // ignore exclusive items when deselecting.
        }

        const newSelected = new Set(exclusive ? [] : selectedItems);

        if (checked) {
            newSelected.add(item);
        } else {
            newSelected.delete(item);
        }

        // Update internal state
        setInternalSelectedItems(newSelected);

        if (exclusive) {
            setUsingOther(false);
        }

        // directly call onSelection with the new set
        onSelectionRef.current &&
            onSelectionRef.current(
                newSelected,
                usingOther && !exclusive ? otherValue : undefined
            );
    };

    return (
        <fieldset
            style={
                {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
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
            {choices.map((item, index) => {
                return (
                    <CheckBoxWithLabel
                        checked={selectedItems.has(item.data)}
                        name={item.name}
                        key={index}
                        onChange={(e) => {
                            handleCheckboxChange(
                                item.data,
                                e.target.checked,
                                item.exclusive
                            );
                        }}
                        disabled={
                            selectedItems.size >= max &&
                            !selectedItems.has(item.data)
                        }
                        required={false}
                    ></CheckBoxWithLabel>
                );
            })}

            {allowOther && (
                <CheckBoxWithLabel
                    checked={usingOther}
                    name="Other"
                    key="other"
                    onChange={(e) => {
                        setHasUserInteracted(true);
                        setUsingOther(e.target.checked);
                    }}
                    required={false}
                    id={'Other' + id}
                >
                    {usingOther && (
                        <FormTextInput
                            type="text"
                            lazy
                            timeOut={300}
                            onLazyChange={(val) => {
                                setHasUserInteracted(true);
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
