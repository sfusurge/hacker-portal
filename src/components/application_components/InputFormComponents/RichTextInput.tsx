'use client';

import { type PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import type { QuestionRichTextInput } from '../types';

import { RichText } from '@/components/ui/RichText/RichText';

export function RichTextInput({
    dataAtom,
    disabled = false,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionRichTextInput>
        | WritableAtom<QuestionRichTextInput, [QuestionRichTextInput], void>;
    disabled?: boolean;
}) {
    const [question, setQuestion] = useAtom(dataAtom);
    return (
        <RichText
            onChange={(d) => {
                setQuestion({ ...question, value: d });
            }}
            readOnly={disabled}
            initialData={question.value}
            maxLength={question.maxLength ?? 99999}
            required={(question.required ?? false) && !disabled}
        />
    );
}
