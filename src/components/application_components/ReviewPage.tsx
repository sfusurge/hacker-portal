'use client';

import type {
    InputFormQuestion,
    InputFormPageData,
    QuestionTextLineInput,
    QuestionTextAreaInput,
    QuestionPhoneInput,
    QuestionNumberInput,
    QuestionCheckBoxInput,
    QuestionMultipleChoice,
    QuestionMultipleCheckBox,
    QuestionDatePicker,
    QuestionDateYmd,
    QuestionApiDropdown,
    QuestionNameInput,
    QuestionFileUploads,
    QuestionRichTextInput,
    QuestionMarkdownInput,
    QuestionTextLinkInput,
    QuestionDropdown,
    QuestionInline,
    QuestionMajorInput,
} from './types';
import style from './ReviewPage.module.css';
import { useState } from 'react';
import { DocumentIcon } from '@heroicons/react/20/solid';
import { getFileSize } from '@/components/ui/FileUpload/FileUpload';
import { RichText } from '@/components/ui/RichText/RichText';
import { MarkdownDisplay } from '@/components/ui/Markdown/MarkdownDisplay';
import { atom } from 'jotai';
import { IframeEmbed } from './IframeEmbed';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import ReviewApplicationDialog from './ReviewApplicationDialog';

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
    const [dialogOpen, setDialogOpen] = useState(false);

    function getQuestionResponse(question: InputFormQuestion) {
        // Type-specific handling based on question type
        switch (question.type) {
            case 'text-line':
            case 'phone':
            case 'text-area':
                const textQuestion = question as
                    | QuestionTextLineInput
                    | QuestionTextAreaInput
                    | QuestionPhoneInput;
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
                            <div key={i} className="min-w-0">
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

                                <div
                                    className={`${style.description} truncate`}
                                    style={{ minWidth: 0 }}
                                >
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

            case 'api-dropdown':
                const apiDropdownQuestion = question as QuestionApiDropdown;
                return apiDropdownQuestion.selection || 'N/A';

            case 'name':
                const nameQuestion = question as QuestionNameInput;
                if (nameQuestion.firstName || nameQuestion.lastName) {
                    return `${nameQuestion.firstName || ''} ${nameQuestion.lastName || ''}`.trim();
                }
                return 'N/A';

            case 'rich-text': {
                const richQuestion = question as QuestionRichTextInput;
                return (
                    <RichText
                        onChange={() => {}}
                        readOnly
                        initialData={richQuestion.value}
                    />
                );
            }

            case 'markdown': {
                const markdownQuestion = question as QuestionMarkdownInput;
                return (
                    <MarkdownDisplay content={markdownQuestion.value ?? ''} />
                );
            }

            case 'major':
                const majorQuestion = question as QuestionMajorInput;
                return Array.isArray(majorQuestion.selection) &&
                    majorQuestion.selection.length > 0
                    ? majorQuestion.selection.join(', ')
                    : 'N/A';

            case 'file-upload':
                const fileQuestion = question as QuestionFileUploads;
                return (
                    <div className={style.fileList}>
                        {fileQuestion.fileList?.map((f, index) => {
                            return (
                                <div
                                    key={index}
                                    className="flex items-center gap-3"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-600/30">
                                        <DocumentIcon className="h-5 w-5 text-neutral-400" />
                                    </div>

                                    <div className="flex flex-1 flex-col gap-1 overflow-hidden text-left">
                                        <span className="truncate">
                                            {f.name}
                                        </span>
                                        <span className="shrink-0 text-xs text-white/60">
                                            {getFileSize(f.size)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );

            default:
                return 'N/A';
        }
    }

    return (
        <div className="mb-28 flex flex-col gap-6 pb-10 md:p-6">
            <h1 className="text-3xl font-semibold">View Submission</h1>
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
                <Button
                    variant={'brand'}
                    hierarchy={'primary'}
                    size="cozy"
                    onClick={() => setDialogOpen(true)}
                    disabled={isSubmitting}
                    className="w-full"
                >
                    Submit Application
                </Button>
            )}
            <ReviewApplicationDialog
                isOpen={dialogOpen}
                closeDialog={() => setDialogOpen(false)}
                onSubmit={async () => {
                    setIsSubmitting(true);
                    await submit();
                    setIsSubmitting(false);
                }}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
