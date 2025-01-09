import { useEffect, useMemo, useState } from 'react';
import { FormTextInput } from '../input/input';

export interface RadioButtonGroupProps {
    options: { data: string; name: string }[];
    allowDeselect?: boolean;
    allowCustomInput?: boolean;
    required?: boolean;
    onSelection?: (data: string | undefined) => void;
    defaultSelection?: string;
}

/**
 * ***options***: an array of {data, name}. "name" is displayed while "data" is for internal representation.
 * "data" is returned in onSelection.
 *
 * ***allowDeselect***: when enabled, user can set value back to undefined by selecting an already selected option
 *
 * ***allowCustomInput***: when enabled, shows a "Others" option at the *end* of the options list.
 * When selected, a custom text input appears for the user type of custom value.
 * TODO: **No validation nor any way to indicate a value is custom for now.**
 *
 * ***required***: When enabled, there must be an selection, or if "Other" is chosen, then the custom input must not be empty.
 *
 * ***onSelection***: this callback triggers whenever a selection is made, only the "data" is returned.
 * This component is not lazy* and triggers as soon as a selection is made.
 * \*However this component *is* lazy when allowCustomInput is on, the textfield only triggers callback every 500ms
 * undefined is returned if user de-selects.
 *
 * ***defaultSelection***: determine if a value should be selected on initial render. Can be any string, will only select on data match.
 */
export function RadioButtonGroup({
    options,
    allowDeselect = false,
    allowCustomInput = false,
    required = false,
    defaultSelection = undefined,
    onSelection,
}: RadioButtonGroupProps) {
    const [selection, setSelection] = useState<string | undefined>(
        defaultSelection
    );

    const datas = useMemo(() => {
        const set = new Set<string | undefined>(
            options.map((item) => item.data)
        );
        set.add(undefined); // so that undefined is an "expected value"
        return set;
    }, []);

    const usingCustomInput = useMemo(() => !datas.has(selection), [selection]);

    useEffect(() => {
        onSelection && onSelection(selection);
    }, [selection]);

    return (
        <fieldset>
            {options.map((item, index) => (
                <label key={index} htmlFor={item.data}>
                    <input
                        type="radio"
                        id={item.data}
                        name={item.name}
                        value={item.data}
                        required={required}
                        checked={item.data === selection}
                        onChange={() => {
                            if (allowDeselect && item.data === selection) {
                                setSelection(undefined);
                            } else {
                                setSelection(item.data);
                            }
                        }}
                    />
                    {item.name}
                </label>
            ))}
            {
                // Other - for custom input
                allowCustomInput && (
                    <label htmlFor="other">
                        <input
                            type="radio"
                            id="other"
                            name="other"
                            checked={usingCustomInput}
                            onChange={() => {
                                if (allowDeselect && usingCustomInput) {
                                    setSelection(undefined);
                                } else {
                                    setSelection('');
                                }
                            }}
                        ></input>
                    </label>
                )
            }

            {
                // TODO, give the custom input validation?
                allowCustomInput && usingCustomInput && (
                    <FormTextInput
                        type="text"
                        lazy
                        onLazyChange={(val) => {
                            setSelection(val as string);
                        }}
                        placeholder="Custom value here"
                    ></FormTextInput>
                )
            }
        </fieldset>
    );
}
