'use client';

import { type PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import type { QuestionMarkdownInput } from '../types';
import { FormTextArea } from '@/components/ui/formTextArea/FormTextArea';
import { isMarkdownFormattingGuide } from '@/lib/markdown/markdownFormattingGuide';

const DEFAULT_PLACEHOLDER = 'Describe your project.';

export function MarkdownInput({
    dataAtom,
    disabled = false,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionMarkdownInput>
        | WritableAtom<QuestionMarkdownInput, [QuestionMarkdownInput], void>;
    disabled?: boolean;
}) {
    const [question, setQuestion] = useAtom(dataAtom);
    const placeHolder = question.placeHolder?.trim() ?? '';
    const textareaPlaceholder =
        placeHolder && !isMarkdownFormattingGuide(placeHolder)
            ? placeHolder
            : DEFAULT_PLACEHOLDER;

    return (
        <FormTextArea
            lazy
            lengthMode="words"
            maxLength={question.maxLength ?? 99999}
            defaultValue={question.value ?? ''}
            onLazyChange={(val) => {
                setQuestion({ ...question, value: val });
            }}
            required={(question.required ?? false) && !disabled}
            disabled={disabled}
            readOnly={disabled}
            placeholder={textareaPlaceholder}
            rows={10}
            className="min-h-[220px] whitespace-pre-wrap placeholder:whitespace-pre-wrap"
        />
    );
}
