import { CSSProperties, useEffect, useMemo, useRef } from 'react';
import { CheckBoxWithLabel } from '../checkbox/checkboxWithLabel';
import style from './CheckBoxGroup.module.css';
interface CheckBoxGroupProps {
    min?: number;
    max?: number;
    choices: { name: string; data: string }[];
    selected?: string[];
    onSelection?: (selected: Set<string>) => void;
    required?: boolean;
}
export function CheckboxGroup({
    min = 0,
    max = 1,
    choices,
    selected: _selected,
    onSelection,
    required,
}: CheckBoxGroupProps) {
    const selected = useMemo(() => new Set(_selected), [_selected]);
    const ref = useRef<HTMLInputElement>(null);

    function updateValidity() {
        if (!ref.current || !required) {
            return;
        }
        if (selected.size > max) {
            ref.current.setCustomValidity(`Too many selections! Max: ${max}`);
        } else if (selected.size < min) {
            ref.current.setCustomValidity(`Too few selections! Min: ${min}`);
        } else {
            ref.current.setCustomValidity('');
        }
    }

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

                        onSelection && onSelection(selected);
                        updateValidity();
                    }}
                    disabled={selected.size >= max && !selected.has(item.data)}
                ></CheckBoxWithLabel>
            ))}
        </fieldset>
    );
}
