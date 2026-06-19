'use client';
import { QuestionDateYmd } from '../types';
import { FormTextInput } from '@/components/ui/input/input';
import { PrimitiveAtom, useAtom, WritableAtom } from 'jotai';

export function DateInput({
    dataAtom,
    disabled = false,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionDateYmd>
        | WritableAtom<QuestionDateYmd, [QuestionDateYmd], void>;
    disabled?: boolean;
}) {
    const [question, setQuestion] = useAtom(dataAtom);

    // Validate YYYY/MM/DD format
    const datePattern = /^\d{4}\/\d{2}\/\d{2}$/;

    return (
        <FormTextInput
            type="text"
            lazy
            timeOut={500}
            onLazyChange={(newVal) => {
                setQuestion({ ...question, value: `${newVal}` });
            }}
            defaultValue={question.value}
            placeholder={question.placeHolder ?? 'YYYY/MM/DD'}
            required={(question.required ?? false) && !disabled}
            disabled={disabled}
            readOnly={disabled}
            pattern={datePattern.source}
            errorMsg="Please enter a valid date in YYYY/MM/DD format"
            style={{ maxWidth: '480px' }}
        />
    );
}
