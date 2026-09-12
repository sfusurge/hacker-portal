'use client';

import {
    FormPhoneInput,
    PHONE_ERROR_MSG,
    PHONE_PATTERN,
} from '@/components/ui/input/FormPhoneInput';
import { PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import type { QuestionPhoneInput } from '../types';

export {
    PHONE_PATTERN,
    PHONE_ERROR_MSG,
    PHONE_MAX_DIGITS,
    clampPhoneDigits,
} from '@/components/ui/input/FormPhoneInput';

export function PhoneNumberInput({
    dataAtom,
    disabled = false,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionPhoneInput>
        | WritableAtom<QuestionPhoneInput, [QuestionPhoneInput], void>;
    disabled?: boolean;
}) {
    const [question, setQuestion] = useAtom(dataAtom);

    return (
        <FormPhoneInput
            name={`phone-${question.questionId}`}
            value={typeof question.value === 'string' ? question.value : ''}
            placeholder={question.placeHolder ?? '6048622113'}
            required={(question.required ?? false) && !disabled}
            disabled={disabled}
            readOnly={disabled}
            autoComplete={question.autoComplete ?? 'tel'}
            pattern={question.validator?.pattern ?? PHONE_PATTERN}
            errorMsg={question.validator?.errorMsg ?? PHONE_ERROR_MSG}
            style={{ maxWidth: '480px' }}
            onValueChange={(digits) => {
                setQuestion({ ...question, value: digits });
            }}
        />
    );
}
