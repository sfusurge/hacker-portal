'use client';

import { type PrimitiveAtom, useAtom } from 'jotai';
import type { QuestionMultipleChoice } from '../types';
import { RadioButtonGroup } from '@/components/ui/radioButtonGroup/radioButtonGroup';
import { useEffect } from 'react';

export function RadioInput({
    dataAtom,
}: {
    dataAtom: PrimitiveAtom<QuestionMultipleChoice>;
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
