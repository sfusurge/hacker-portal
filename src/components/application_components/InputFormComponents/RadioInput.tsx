'use client';

import { type PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import { useEffect } from 'react';
import type { QuestionMultipleChoice } from '../types';
import { RadioButtonGroup } from '@/components/ui/radioButtonGroup/radioButtonGroup';

export function RadioInput({
    dataAtom,
    disabled = false,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionMultipleChoice>
        | WritableAtom<QuestionMultipleChoice, [QuestionMultipleChoice], void>;
    disabled?: boolean;
}) {
    const [question, setQuestion] = useAtom(dataAtom);

    useEffect(() => {
        if (disabled || !question.value) return;
        const selected = question.choices.find(
            (choice) => choice.data === question.value
        );
        if (selected?.disabled) {
            setQuestion({ ...question, value: undefined });
        }
    }, [disabled, question.choices, question.value]);

    return (
        <RadioButtonGroup
            options={question.choices}
            allowCustomInput={question.allowCustom ?? false}
            allowDeselect={question.allowDeselect ?? false}
            defaultSelection={question.value}
            required={question.required ?? false}
            disabled={disabled}
            onSelection={(newVal) => {
                setQuestion({ ...question, value: newVal });
            }}
            // Use questionId instead of title for the name to avoid potential issues with long titles
            name={`question-${question.questionId}`}
        />
    );
}
