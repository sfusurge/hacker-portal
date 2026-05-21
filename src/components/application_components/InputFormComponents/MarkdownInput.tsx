'use client';

import { type PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import type { QuestionMarkdownInput } from '../types';
import { FormTextArea } from '@/components/ui/formTextArea/FormTextArea';

function defaultMarkdownPlaceholder() {
    return [
        `Describe your project.`,
        '',
        'You can use Markdown:',
        '• **bold** and *italic*',
        '• Bullet lists',
        '• [links](https://example.com)',
        '',
    ].join('\n');
}

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
            placeholder={
                question.placeHolder?.trim() || defaultMarkdownPlaceholder()
            }
            rows={10}
            className="min-h-[220px] whitespace-pre-wrap placeholder:whitespace-pre-wrap"
        />
    );
}
