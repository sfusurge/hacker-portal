'use client';

import { type PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import type { QuestionMarkdownInput } from '../types';
import { FormTextArea } from '@/components/ui/formTextArea/FormTextArea';
import { MarkdownDisplay } from '@/components/ui/Markdown/MarkdownDisplay';
import {
    isMarkdownFormattingGuide,
    MARKDOWN_FORMATTING_GUIDE,
} from '@/lib/markdown/markdownFormattingGuide';

function defaultMarkdownPlaceholder() {
    return 'Describe your project. See the formatting reference below for Markdown examples.';
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
    const placeHolder = question.placeHolder?.trim() ?? '';
    const formattingGuide =
        placeHolder && isMarkdownFormattingGuide(placeHolder)
            ? placeHolder
            : MARKDOWN_FORMATTING_GUIDE;
    const textareaPlaceholder =
        placeHolder && !isMarkdownFormattingGuide(placeHolder)
            ? placeHolder
            : defaultMarkdownPlaceholder();

    return (
        <div className="flex w-full max-w-full min-w-0 flex-col gap-4">
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
            <div
                className="rounded-lg border border-neutral-600/40 bg-neutral-900/80 p-4"
                aria-label="Markdown formatting reference"
            >
                <p className="mb-3 text-sm font-medium text-white/80">
                    Formatting reference
                </p>
                <MarkdownDisplay content={formattingGuide} />
            </div>
        </div>
    );
}
