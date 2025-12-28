'use client';

import { useMemo } from 'react';
import { type PrimitiveAtom, useAtom, WritableAtom, atom } from 'jotai';
import type { QuestionInline, InputFormQuestion } from '../types';
import { TextLineInput } from './TextLineInput';
import { TextLinkInput } from './TextLinkInput';
import { NumberInput } from './NumberInput';
import { RadioInput } from './RadioInput';
import { CheckBoxInput } from './CheckboxInput';
import { CheckBoxGroupInput } from './CheckboxGroupInput';
import { TextAreaInput } from './TextAreaInput';
import { FileUploadInput } from './FileUploadInput';
import { RichTextInput } from './RichTextInput';
import { ApiDropdownInput } from './ApiDropdownInput';
import { DateInput } from './DateInput';
import type {
    QuestionTextLineInput,
    QuestionTextLinkInput,
    QuestionNumberInput,
    QuestionMultipleChoice,
    QuestionCheckBoxInput,
    QuestionMultipleCheckBox,
    QuestionTextAreaInput,
    QuestionFileUploads,
    QuestionRichTextInput,
    QuestionApiDropdown,
    QuestionDateYmd,
} from '../types';
import { Label } from '@/components/ui/label/label';
import { cn } from '@/lib/utils';
import style from '../InputForm.module.css';

export function InlineInput({
    dataAtom,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionInline>
        | WritableAtom<QuestionInline, [QuestionInline], void>;
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
        contentAtom: PrimitiveAtom<InputFormQuestion>,
        index: number
    ) => {
        switch (contentQuestion.type) {
            case 'text-line':
                return (
                    <TextLineInput
                        dataAtom={
                            contentAtom as PrimitiveAtom<QuestionTextLineInput>
                        }
                    />
                );
            case 'link':
                return (
                    <TextLinkInput
                        dataAtom={
                            contentAtom as PrimitiveAtom<QuestionTextLinkInput>
                        }
                    />
                );
            case 'number':
                return (
                    <NumberInput
                        dataAtom={
                            contentAtom as PrimitiveAtom<QuestionNumberInput>
                        }
                    />
                );
            case 'multiple-choice':
                return (
                    <RadioInput
                        dataAtom={
                            contentAtom as PrimitiveAtom<QuestionMultipleChoice>
                        }
                    />
                );
            case 'checkbox':
                return (
                    <CheckBoxInput
                        dataAtom={
                            contentAtom as PrimitiveAtom<QuestionCheckBoxInput>
                        }
                    />
                );
            case 'multiple-checkbox':
                return (
                    <CheckBoxGroupInput
                        dataAtom={
                            contentAtom as PrimitiveAtom<QuestionMultipleCheckBox>
                        }
                    />
                );
            case 'text-area':
                return (
                    <TextAreaInput
                        dataAtom={
                            contentAtom as PrimitiveAtom<QuestionTextAreaInput>
                        }
                    />
                );
            case 'file-upload':
                return (
                    <FileUploadInput
                        dataAtom={
                            contentAtom as PrimitiveAtom<QuestionFileUploads>
                        }
                    />
                );
            case 'rich-text':
                return (
                    <RichTextInput
                        dataAtom={
                            contentAtom as PrimitiveAtom<QuestionRichTextInput>
                        }
                    />
                );
            case 'api-dropdown':
                return (
                    <ApiDropdownInput
                        dataAtom={
                            contentAtom as PrimitiveAtom<QuestionApiDropdown>
                        }
                    />
                );
            case 'date-ymd':
                return (
                    <DateInput
                        dataAtom={contentAtom as PrimitiveAtom<QuestionDateYmd>}
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
                                index
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
