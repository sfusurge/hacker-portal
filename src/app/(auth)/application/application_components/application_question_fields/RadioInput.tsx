'use client';

import { type PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import type { QuestionMultipleChoice } from '../types';
import { RadioButtonGroup } from '@/components/ui/radioButtonGroup/radioButtonGroup';

export function RadioInput({
    dataAtom,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionMultipleChoice>
        | WritableAtom<QuestionMultipleChoice, [QuestionMultipleChoice], void>;
}) {
    const [question, setQuestion] = useAtom(dataAtom);

    return (
        <RadioButtonGroup
            options={question.choices}
            allowCustomInput={question.allowCustom ?? false}
            allowDeselect={question.allowDeselect ?? false}
            defaultSelection={question.value}
            required={question.required ?? false}
            onSelection={(newVal) => {
                setQuestion({ ...question, value: newVal });
            }}
            // Use questionId instead of title for the name to avoid potential issues with long titles
            name={`question-${question.questionId}`}
        />
    );
}
