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

    // Debug log to see what's happening with this specific question
    useEffect(() => {
        if (
            question.title?.includes('photograph') ||
            question.questionId === 16
        ) {
            console.log('Photo consent question:', {
                questionId: question.questionId,
                title: question.title,
                value: question.value,
                choices: question.choices,
                required: question.required,
            });
        }
    }, [question]);

    return (
        <RadioButtonGroup
            options={question.choices}
            allowCustomInput={question.allowCustom ?? false}
            allowDeselect={question.allowDeselect ?? false}
            defaultSelection={question.value}
            required={question.required ?? false}
            onSelection={(newVal) => {
                console.log(
                    `Selection changed for question ${question.questionId}: ${newVal}`
                );
                setQuestion({ ...question, value: newVal });
            }}
            // Use questionId instead of title for the name to avoid potential issues with long titles
            name={`question-${question.questionId}`}
        />
    );
}
