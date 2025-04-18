'use client';

import { type PrimitiveAtom, useAtom } from 'jotai';
import type { QuestionMultipleCheckBox } from '../types';
import { CheckboxGroup } from '@/components/ui/checkboxGroup/CheckBoxGroup';
import { useCallback } from 'react';

export function CheckBoxGroupInput({
    dataAtom,
}: {
    dataAtom: PrimitiveAtom<QuestionMultipleCheckBox>;
}) {
    const [question, setQuestion] = useAtom(dataAtom);

    // Extract selected values from choices
    const selectedValues = question.choices
        .filter((item) => item.value)
        .map((item) => item.data);

    // Use a callback to handle selection changes
    const handleSelection = useCallback(
        (selected: Set<string>, other?: string) => {
            setQuestion((prev) => ({
                ...prev,
                otherValue: other,
                choices: prev.choices.map((item) => ({
                    ...item,
                    value: selected.has(item.data),
                })),
            }));
        },
        [setQuestion]
    );

    return (
        <CheckboxGroup
            choices={question.choices}
            min={question.min ?? 1}
            max={question.max ?? 99}
            required={question.required ?? false}
            selected={selectedValues}
            onSelection={handleSelection}
            allowOther={question.allowOther}
            otherValue={question.otherValue}
        />
    );
}
