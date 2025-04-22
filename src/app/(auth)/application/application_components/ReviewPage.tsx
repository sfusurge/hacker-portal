'use client';

import type {
    ApplicationQuestion,
    ApplicationPage,
    QuestionTextLineInput,
    QuestionTextAreaInput,
    QuestionNumberInput,
    QuestionCheckBoxInput,
    QuestionMultipleChoice,
    QuestionMultipleCheckBox,
    QuestionDatePicker,
    QuestionSchoolName,
    QuestionNameInput,
} from './types';
import style from './ApplicationForm.module.css';
import { useMemo, useEffect } from 'react';
import { SkewmorphicButton } from '@/components/ui/SkewmorphicButton/SkewmorphicButton';

export interface ReviewPageProps {
    submit: () => void;
    mobileMode?: boolean;
    response: ApplicationPage[];
}

/**
 * Review Page Gets a submit button if mobile mode.
 */
export function ReviewPage({
    submit,
    response,
    mobileMode = false,
}: ReviewPageProps) {
    // Add this debug log at the beginning of the component

    function getQuestionResponse(question: ApplicationQuestion) {
        // Type-specific handling based on question type
        switch (question.type) {
            case 'text-line':
            case 'text-area':
                const textQuestion = question as
                    | QuestionTextLineInput
                    | QuestionTextAreaInput;
                return textQuestion.value?.trim() || 'N/A';

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
                return multiChoiceQuestion.value || 'N/A';

            case 'date':
                const dateQuestion = question as QuestionDatePicker;
                return dateQuestion.value || 'N/A';

            case 'school-name':
                const schoolQuestion = question as QuestionSchoolName;
                return schoolQuestion.value || 'N/A';

            case 'name':
                const nameQuestion = question as QuestionNameInput;
                if (nameQuestion.firstName || nameQuestion.lastName) {
                    return `${nameQuestion.firstName || ''} ${nameQuestion.lastName || ''}`.trim();
                }
                return 'N/A';

            default:
                return 'N/A';
        }
    }

    const flattenedQuestions = useMemo(() => {
        return response.flatMap(({ questions }) => questions || []);
    }, [response]);

    return (
        <div className="mb-28 flex flex-col gap-6 p-6">
            <h1 className="text-2xl font-medium">Review Application</h1>

            {flattenedQuestions.length === 0 ? (
                <div className="py-4 text-center">No questions to review</div>
            ) : (
                flattenedQuestions.map((question, index) => {
                    const response = getQuestionResponse(question);
                    return (
                        <div key={index} className="border-b pb-4">
                            <h3 className={style.title}>{question.title}</h3>
                            <span className={`${style.description} mt-2 block`}>
                                {response}
                            </span>
                        </div>
                    );
                })
            )}

            {mobileMode && (
                <SkewmorphicButton
                    onClick={submit}
                    className="mt-4"
                    style={{ background: 'var(--brand-500)' }}
                >
                    Submit!
                </SkewmorphicButton>
            )}
        </div>
    );
}
