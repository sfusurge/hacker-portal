'use client';

import { type PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import type { QuestionMarkdownInput } from '../types';
import { FormTextArea } from '@/components/ui/formTextArea/FormTextArea';

export function MarkdownInput({
    dataAtom,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionMarkdownInput>
        | WritableAtom<QuestionMarkdownInput, [QuestionMarkdownInput], void>;
}) {
    const [question, setQuestion] = useAtom(dataAtom);
    return (
        <FormTextArea
            lazy
            lengthMode="characters"
            maxLength={question.maxLength ?? 99999}
            defaultValue={question.value ?? ''}
            onLazyChange={(val) => {
                setQuestion({ ...question, value: val });
            }}
            required={question.required ?? false}
            placeholder={
                question.placeHolder ??
                'Write in Markdown (e.g. **bold**, lists, links)'
            }
            rows={8}
        />
    );
}
