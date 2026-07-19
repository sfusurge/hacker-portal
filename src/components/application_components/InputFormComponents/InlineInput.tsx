'use client';

import { useMemo } from 'react';
import { type PrimitiveAtom, useAtom, WritableAtom, atom } from 'jotai';
import type { QuestionInline, InputFormQuestion } from '../types';
import { TextLineInput } from './TextLineInput';
import { TitleLineInput } from './TitleLineInput';
import { TextLinkInput } from './TextLinkInput';
import { NumberInput } from './NumberInput';
import { RadioInput } from './RadioInput';
import { CheckBoxInput } from './CheckboxInput';
import { CheckBoxGroupInput } from './CheckboxGroupInput';
import { TextAreaInput } from './TextAreaInput';
import { FileUploadInput } from './FileUploadInput';
import { RichTextInput } from './RichTextInput';
import { MarkdownInput } from './MarkdownInput';
import { ApiDropdownInput } from './ApiDropdownInput';
import { DateInput } from './DateInput';
import type {
    QuestionTextLineInput,
    QuestionTitleLineInput,
    QuestionTextLinkInput,
    QuestionNumberInput,
    QuestionMultipleChoice,
    QuestionCheckBoxInput,
    QuestionMultipleCheckBox,
    QuestionTextAreaInput,
    QuestionFileUploads,
    QuestionRichTextInput,
    QuestionMarkdownInput,
    QuestionApiDropdown,
    QuestionDateYmd,
} from '../types';
import { Label } from '@/components/ui/label/label';
import { cn } from '@/lib/utils';
import style from '../InputForm.module.css';

export function InlineInput({
    dataAtom,
    disabled = false,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionInline>
        | WritableAtom<QuestionInline, [QuestionInline], void>;
    disabled?: boolean;
}) {
    const [question] = useAtom(dataAtom);

    // Create atoms for each content question
    const contentAtoms = useMemo(() => {
        return question.content.map((contentQuestion, index) => {
            return atom(
                (get) => {
                    const q = get(dataAtom);
                    return q.content[index];
                },
                (get, set, newQuestion: InputFormQuestion) => {
                    const q = get(dataAtom);
                    const newContent = [...q.content];
                    newContent[index] = newQuestion;
                    set(dataAtom, { ...q, content: newContent });
                }
            );
        });
    }, [question.content, dataAtom]);

    const renderContentQuestion = (
        contentQuestion: InputFormQuestion,
        contentAtom: WritableAtom<InputFormQuestion, [InputFormQuestion], void>,
        index: number,
        inputDisabled: boolean
    ) => {
        switch (contentQuestion.type) {
            case 'text-line':
                return (
                    <TextLineInput
                        dataAtom={
                            contentAtom as PrimitiveAtom<QuestionTextLineInput>
                        }
                        disabled={inputDisabled}
                    />
                );
            case 'title-line':
                return (
                    <TitleLineInput
                        dataAtom={
                            contentAtom as PrimitiveAtom<QuestionTitleLineInput>
                        }
                        disabled={inputDisabled}
                    />
                );
            case 'link':
                return (
                    <TextLinkInput
                        dataAtom={
                            contentAtom as PrimitiveAtom<QuestionTextLinkInput>
                        }
                        disabled={inputDisabled}
                    />
                );
            case 'number':
                return (
                    <NumberInput
                        dataAtom={
                            contentAtom as PrimitiveAtom<QuestionNumberInput>
                        }
                        disabled={inputDisabled}
                    />
                );
            case 'multiple-choice':
                return (
                    <RadioInput
                        dataAtom={
                            contentAtom as PrimitiveAtom<QuestionMultipleChoice>
                        }
                        disabled={inputDisabled}
                    />
                );
            case 'checkbox':
                return (
                    <CheckBoxInput
                        dataAtom={
                            contentAtom as PrimitiveAtom<QuestionCheckBoxInput>
                        }
                        disabled={inputDisabled}
                    />
                );
            case 'multiple-checkbox':
                return (
                    <CheckBoxGroupInput
                        dataAtom={
                            contentAtom as PrimitiveAtom<QuestionMultipleCheckBox>
                        }
                        disabled={inputDisabled}
                    />
                );
            case 'text-area':
                return (
                    <TextAreaInput
                        dataAtom={
                            contentAtom as PrimitiveAtom<QuestionTextAreaInput>
                        }
                        disabled={inputDisabled}
                    />
                );
            case 'file-upload':
                return (
                    <FileUploadInput
                        dataAtom={
                            contentAtom as PrimitiveAtom<QuestionFileUploads>
                        }
                        disabled={inputDisabled}
                    />
                );
            case 'rich-text':
                return (
                    <RichTextInput
                        dataAtom={
                            contentAtom as PrimitiveAtom<QuestionRichTextInput>
                        }
                        disabled={inputDisabled}
                    />
                );
            case 'markdown':
                return (
                    <MarkdownInput
                        dataAtom={
                            contentAtom as PrimitiveAtom<QuestionMarkdownInput>
                        }
                        disabled={inputDisabled}
                    />
                );
            case 'api-dropdown':
                return (
                    <ApiDropdownInput
                        dataAtom={
                            contentAtom as PrimitiveAtom<QuestionApiDropdown>
                        }
                        disabled={inputDisabled}
                    />
                );
            case 'date-ymd':
                return (
                    <DateInput
                        dataAtom={contentAtom as PrimitiveAtom<QuestionDateYmd>}
                        disabled={inputDisabled}
                    />
                );
            default:
                return (
                    <div>
                        Unsupported inline content type: {contentQuestion.type}
                    </div>
                );
        }
    };

    return (
        <div
            className="flex flex-wrap gap-4"
            style={{ width: '100%', maxWidth: '480px' }}
        >
            {contentAtoms.map((contentAtom, index) => {
                const contentQuestion = question.content[index];
                return (
                    <div key={index} className="min-w-[200px] flex-1">
                        <div
                            className={cn(style.ver)}
                            style={{ width: '100%' }}
                            {...(contentQuestion.questionId != null
                                ? {
                                      'data-question-id':
                                          contentQuestion.questionId,
                                  }
                                : {})}
                        >
                            {contentQuestion.title && (
                                <Label required={contentQuestion.required}>
                                    <div
                                        className={style.htmlHolder}
                                        dangerouslySetInnerHTML={{
                                            __html: contentQuestion.title,
                                        }}
                                    ></div>
                                </Label>
                            )}
                            {contentQuestion.description && (
                                <span
                                    className={cn(
                                        style.description,
                                        'max-w-96'
                                    )}
                                >
                                    <div
                                        className={style.htmlHolder}
                                        dangerouslySetInnerHTML={{
                                            __html: contentQuestion.description,
                                        }}
                                    ></div>
                                </span>
                            )}
                            {renderContentQuestion(
                                contentQuestion,
                                contentAtom,
                                index,
                                disabled
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
