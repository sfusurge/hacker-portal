'use client';

import { type PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import type { QuestionRichTextInput } from '../types';

import { RichText } from '@/components/ui/RichText/RichText';

export function RichTextInput({
    dataAtom,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionRichTextInput>
        | WritableAtom<QuestionRichTextInput, [QuestionRichTextInput], void>;
}) {
    const [question, setQuestion] = useAtom(dataAtom);
    return (
        <RichText
            onChange={(d) => {
                setQuestion({ ...question, value: d });
            }}
            readOnly={false}
            initialData={question.value}
        />
    );
}
