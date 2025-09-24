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
    QuestionSchoolName,
    QuestionNameInput,
    QuestionFileUploads,
    QuestionRichTextInput,
    QuestionTextLinkInput,
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

            case 'date':
                const dateQuestion = question as QuestionDatePicker;
                return dateQuestion.value || 'N/A';

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
            <h1 className="text-2xl font-medium">Review Application</h1>

            {flattenedQuestions.length === 0 ? (
                <div className="py-4 text-center">No questions to review</div>
            ) : (
                <>
                    <Alert variant={'info'} className="-mt-2 max-w-[480px]">
                        <AlertTitle>
                            Take the time to review your responses carefully!
                        </AlertTitle>
                        <AlertDescription>
                            Make sure everything&apos;s filled out correctly.
                            Once you submit your application you won&apos;t be
                            able to make changes.
                        </AlertDescription>
                    </Alert>
                    {flattenedQuestions.map((question, index) => {
                        const response = getQuestionResponse(question);
                        return (
                            <div key={index}>
                                <h3 className={style.title}>
                                    <div
                                        className={style.htmlHolder}
                                        style={{ display: 'inline' }}
                                        dangerouslySetInnerHTML={{
                                            __html: question.title ?? '',
                                        }}
                                    ></div>
                                </h3>
                                <span
                                    className={`${style.description} mt-2 block`}
                                >
                                    {response}
                                </span>
                            </div>
                        );
                    })}
                </>
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
