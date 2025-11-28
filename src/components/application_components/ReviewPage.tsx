'use client';

import type {
    InputFormQuestion,
    InputFormPageData,
    QuestionTextLineInput,
    QuestionTextAreaInput,
    QuestionNumberInput,
    QuestionCheckBoxInput,
    QuestionMultipleChoice,
    QuestionMultipleCheckBox,
    QuestionDatePicker,
    QuestionDateYmd,
    QuestionSchoolName,
    QuestionNameInput,
    QuestionFileUploads,
    QuestionRichTextInput,
    QuestionTextLinkInput,
    QuestionDropdown,
    QuestionInline,
} from './types';
import style from './ReviewPage.module.css';
import { useMemo, useEffect, CSSProperties, useState } from 'react';
import { SkewmorphicButton } from '@/components/ui/SkewmorphicButton/SkewmorphicButton';
import { Card, CardContent } from '@/components/ui/card';
import { DocumentIcon } from '@heroicons/react/20/solid';
import { getFileSize } from '@/components/ui/FileUpload/FileUpload';
import { RichText } from '@/components/ui/RichText/RichText';
import { atom } from 'jotai';
import { IframeEmbed } from './IframeEmbed';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

export interface ReviewPageProps {
    submit: () => void | Promise<void>;
    mobileMode?: boolean;
    response: InputFormPageData[];
    disableSubmitBtn?: boolean;
}

export const submitMessageAtom = atom({
    title: 'Confirm Submission',
    content: 'This form cannot be edited after submission.',
});

/**
 * Review Page Gets a submit button if mobile mode.
 */
export function ReviewPage({
    submit,
    response,
    mobileMode = false,
    disableSubmitBtn = false,
}: ReviewPageProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            await submit();
        } catch (error) {
            console.error('Submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };
    function getQuestionResponse(question: InputFormQuestion) {
        // Type-specific handling based on question type
        switch (question.type) {
            case 'text-line':
            case 'text-area':
                const textQuestion = question as
                    | QuestionTextLineInput
                    | QuestionTextAreaInput;
                return typeof textQuestion.value === 'string'
                    ? textQuestion.value.trim() || 'N/A'
                    : 'N/A';

            case 'link': {
                const linkQuestion = question as QuestionTextLinkInput;
                const rawUrl =
                    typeof linkQuestion.value === 'string'
                        ? linkQuestion.value.trim()
                        : String(linkQuestion.value || '').trim();

                if (!rawUrl) return 'N/A';
                return <IframeEmbed url={rawUrl} />;
            }

            case 'number':
                const numQuestion = question as QuestionNumberInput;
                return numQuestion.value !== undefined
                    ? String(numQuestion.value)
                    : 'N/A';

            case 'checkbox':
                const checkboxQuestion = question as QuestionCheckBoxInput;
                checkboxQuestion.title = checkboxQuestion.label;
                return checkboxQuestion.value === true ? 'Yes' : 'No';

            case 'multiple-checkbox':
                const multiCheckboxQuestion =
                    question as QuestionMultipleCheckBox;
                if (Array.isArray(multiCheckboxQuestion.choices)) {
                    const selectedChoices = multiCheckboxQuestion.choices
                        .filter((item) => item.value === true)
                        .map((item) => item.name);

                    // Include "Other" value if present
                    if (
                        multiCheckboxQuestion.allowOther &&
                        multiCheckboxQuestion.otherValue
                    ) {
                        selectedChoices.push(multiCheckboxQuestion.otherValue);
                    }

                    return selectedChoices.length > 0
                        ? selectedChoices.join(', ')
                        : 'N/A';
                }
                return 'N/A';

            case 'dropdown':
                const dropdownQuestion = question as QuestionDropdown;
                return dropdownQuestion.value || 'N/A';

            case 'multiple-choice':
                const multiChoiceQuestion = question as QuestionMultipleChoice;

                if (multiChoiceQuestion.value) {
                    const selectedChoice = multiChoiceQuestion.choices.find(
                        (choice) => choice.data === multiChoiceQuestion.value
                    );

                    return selectedChoice
                        ? selectedChoice.name
                        : multiChoiceQuestion.value;
                }

                return 'N/A';

            case 'inline': {
                const inlineQuestion = question as QuestionInline;

                if (!inlineQuestion.content?.length) return 'N/A';

                return (
                    <div className="grid grid-cols-2 gap-6">
                        {inlineQuestion.content.map((child, i) => (
                            <div key={i}>
                                <h3 className={style.title}>
                                    <div
                                        className={style.htmlHolder}
                                        style={{ display: 'inline' }}
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                child.title ??
                                                `Question ${i + 1}`,
                                        }}
                                    />
                                </h3>

                                <div className={`${style.description} block`}>
                                    {getQuestionResponse(child)}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }

            case 'date':
                const dateQuestion = question as QuestionDatePicker;
                return dateQuestion.value || 'N/A';

            case 'date-ymd':
                const dateYmdQuestion = question as QuestionDateYmd;
                return dateYmdQuestion.value || 'N/A';

            case 'school-name':
                const schoolQuestion = question as QuestionSchoolName;
                return schoolQuestion.selection || 'N/A';

            case 'name':
                const nameQuestion = question as QuestionNameInput;
                if (nameQuestion.firstName || nameQuestion.lastName) {
                    return `${nameQuestion.firstName || ''} ${nameQuestion.lastName || ''}`.trim();
                }
                return 'N/A';

            case 'rich-text':
                const richQuestion = question as QuestionRichTextInput;

                return (
                    <RichText
                        onChange={() => {}}
                        readOnly
                        initialData={richQuestion.value}
                    />
                );

            case 'file-upload':
                const fileQuestion = question as QuestionFileUploads;
                return (
                    <div className={style.fileList}>
                        {fileQuestion.fileList?.map((f, index) => {
                            if (f.type.startsWith('image')) {
                                return (
                                    <div
                                        className={style.displayImage}
                                        style={
                                            {
                                                '--imageName': `"${f.name}"`,
                                            } as CSSProperties
                                        }
                                        key={`${index}${f.name}`}
                                    >
                                        <img
                                            src={URL.createObjectURL(f)}
                                            alt={f.name}
                                        />
                                    </div>
                                );
                            }
                            return (
                                <Card key={f.name}>
                                    <CardContent>
                                        <div className={style.hor}>
                                            <DocumentIcon
                                                style={{ width: '2rem' }}
                                            />
                                            <div className={style.ver}>
                                                <span
                                                    style={{
                                                        color: 'var(--text-secondary)',
                                                    }}
                                                >
                                                    {f.name}
                                                </span>
                                                <span
                                                    style={{
                                                        color: 'var(--text-secondary)',
                                                    }}
                                                >
                                                    {getFileSize(f.size)}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                );

            default:
                return 'N/A';
        }
    }

    const flattenedQuestions = useMemo(() => {
        return response.flatMap(({ questions }) => questions || []);
    }, [response]);

    return (
        <div className="mb-28 flex flex-col gap-6 p-6 pb-10">
            <h1 className="text-3xl font-semibold">Review Application</h1>
            <Alert variant={'info'} className="-mt-2 max-w-[480px]">
                <AlertTitle>
                    Take the time to review your responses carefully!
                </AlertTitle>
                <AlertDescription>
                    Make sure everything&apos;s filled out correctly. Once you
                    submit your application, you won&apos;t be able to make
                    changes.
                </AlertDescription>
            </Alert>

            {response.length === 0 ? (
                <div className="py-4 text-center">No questions to review</div>
            ) : (
                response.map((page, pageIndex) => (
                    <div
                        key={pageIndex}
                        className="bg-neutral-850 flex max-w-[480px] flex-col gap-4 rounded-lg border border-neutral-700/18 p-6"
                    >
                        <h2 className="text-2xl font-semibold">
                            {page.title || `Page ${pageIndex + 1}`}
                        </h2>

                        <div className="flex flex-col gap-6">
                            {page.questions?.map((question, questionIndex) => {
                                const resp = getQuestionResponse(question);

                                return (
                                    <div key={questionIndex}>
                                        <h3 className={style.title}>
                                            <div
                                                className={style.htmlHolder}
                                                style={{ display: 'inline' }}
                                                dangerouslySetInnerHTML={{
                                                    __html:
                                                        question.title ?? '',
                                                }}
                                            />
                                        </h3>

                                        <div
                                            className={`${style.description} block`}
                                        >
                                            {resp}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}

            {mobileMode && !disableSubmitBtn && (
                <SkewmorphicButton
                    onClick={handleSubmit}
                    className="mt-4"
                    style={{ background: 'var(--brand-500)' }}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit!'}
                </SkewmorphicButton>
            )}
        </div>
    );
}
