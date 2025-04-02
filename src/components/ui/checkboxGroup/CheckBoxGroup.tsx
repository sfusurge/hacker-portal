import {
    CSSProperties,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { CheckBoxWithLabel } from '../checkbox/checkboxWithLabel';
import style from './CheckBoxGroup.module.css';
import { FormTextInput } from '../input/input';
import { setSourceMapsEnabled } from 'process';

interface CheckBoxGroupProps {
    min?: number;
    max?: number;
    choices: { name: string; data: string }[];
    selected?: string[];
    onSelection?: (selected: Set<string>, other: string | undefined) => void;
    allowOther?: boolean;
    otherValue?: string | undefined;
    required?: boolean;
}
export function CheckboxGroup({
    min = 0,
    max = 1,
    choices,
    selected: _selected,
    allowOther = false,
    otherValue: defaultOther,
    onSelection,
    required,
}: CheckBoxGroupProps) {
    const selected = useMemo(() => new Set(_selected), [_selected]);
    const [otherValue, setOtherValue] = useState<string | undefined>(
        defaultOther
    );
    const [usingOther, setUsingOther] = useState(
        allowOther && otherValue !== undefined
    );
    const ref = useRef<HTMLInputElement>(null);

    function updateValidity() {
        if (!ref.current || !required) {
            return;
        }

        if (usingOther && !otherValue) {
            ref.current.setCustomValidity("Please fill the 'Other' value.");
        } else {
            const count = selected.size + (otherValue && usingOther ? 1 : 0);

            if (count > max) {
                ref.current.setCustomValidity(
                    `Too many selections! Max: ${max}`
                );
            } else if (count < min) {
                ref.current.setCustomValidity(
                    `Too few selections! Min: ${min}`
                );
            } else {
                ref.current.setCustomValidity('');
            }
        }

        triggerOnSelect();
    }

    function triggerOnSelect() {
        onSelection &&
            onSelection(selected, usingOther ? otherValue : undefined);
    }

    const mounted = useRef(false);
    useEffect(() => {
        if (mounted.current) {
            updateValidity();
        } else {
            mounted.current = true;
        }
    }, [otherValue, usingOther]);

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
                required
                defaultValue={'n/a'}
            />
            {choices.map((item, index) => (
                <CheckBoxWithLabel
                    checked={selected.has(item.data)}
                    name={item.name}
                    key={index}
                    onChange={(e) => {
                        if (e.target.checked) {
                            selected.add(item.data);
                        } else {
                            selected.delete(item.data);
                        }

                        updateValidity();
                    }}
                    disabled={selected.size >= max && !selected.has(item.data)}
                    required={false}
                ></CheckBoxWithLabel>
            ))}

            {allowOther && (
                <CheckBoxWithLabel
                    checked={usingOther}
                    // defaultChecked={usingOther}
                    name="Other"
                    key="other"
                    onChange={(e) => {
                        if (e.target.checked) {
                            setUsingOther(true);
                        } else {
                            setUsingOther(false);
                        }
                    }}
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
                            required={required}
                            errorMsg="Required!"
                            placeholder="Customer value here"
                            hideBackground
                        />
                    )}
                </CheckBoxWithLabel>
            )}
        </fieldset>
    );
}
