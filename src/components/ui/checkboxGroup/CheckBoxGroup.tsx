import { useMemo } from 'react';
import { CheckBoxWithLabel } from '../checkbox/checkboxWithLabel';

interface CheckBoxGroupProps {
    min?: number;
    max?: number;
    choices: { name: string; data: string }[];
    selected?: string[];
    onSelection?: (selected: Set<string>) => void;
    required?: boolean;
}
export function CheckboxGroup({
    min = 1,
    max = 1,
    choices,
    selected: _selected,
    onSelection,
    required,
}: CheckBoxGroupProps) {
    const selected = useMemo(() => new Set(_selected), [_selected]);

    return (
        <fieldset
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
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
                    }}
                    disabled={selected.size >= max && !selected.has(item.data)}
                ></CheckBoxWithLabel>
            ))}
        </fieldset>
    );
}
