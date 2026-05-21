'use client';

import { PrimitiveAtom, useAtom, useAtomValue, WritableAtom } from 'jotai';
import type { QuestionMultipleCheckBox } from '../types';
import { CheckboxGroup } from '@/components/ui/checkboxGroup/CheckBoxGroup';

export function CheckBoxGroupInput({
    dataAtom,
    disabled = false,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionMultipleCheckBox>
        | WritableAtom<
              QuestionMultipleCheckBox,
              [QuestionMultipleCheckBox],
              void
          >;
    disabled?: boolean;
}) {
    const [question, setQuestion] = useAtom(dataAtom);

    // Extract selected values from choices
    const selectedValues = question.choices
        .filter((item) => item.value)
        .map((item) => item.data);

    // Use a callback to handle selection changes
    function handleSelection(selected: Set<string>, other?: string) {
        setQuestion({
            ...question,
            otherValue: other,
            choices: question.choices.map((item) => ({
                ...item,
                value: selected.has(item.data),
            })),
        });
    }

    return (
        <CheckboxGroup
            id={question.questionId}
            choices={question.choices}
            min={question.min ?? 1}
            max={question.max ?? 99}
            required={(question.required ?? false) && !disabled}
            disabled={disabled}
            selected={selectedValues}
            onSelection={handleSelection}
            allowOther={question.allowOther}
            otherValue={question.otherValue}
        />
    );
}
