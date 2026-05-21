'use client';

import { Label } from '@/components/ui/label/label';
import { QuestionTextLineInput } from '../types';
import { FormTextInput, Input } from '@/components/ui/input/input';
import {
    atom,
    PrimitiveAtom,
    useAtom,
    useSetAtom,
    WritableAtom,
    type Atom,
} from 'jotai';
import { useCallback, useEffect, useMemo, useRef } from 'react';

export function TextLineInput({
    dataAtom,
    disabled = false,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionTextLineInput>
        | WritableAtom<QuestionTextLineInput, [QuestionTextLineInput], void>;
    disabled?: boolean;
}) {
    const [question, setQuestion] = useAtom(dataAtom);

    const normalizedValue =
        typeof question.value === 'string' ? question.value : undefined;

    return (
        <FormTextInput
            type="search"
            lazy
            timeOut={500}
            onLazyChange={(newVal) => {
                setQuestion({ ...question, value: `${newVal}` });
            }}
            defaultValue={normalizedValue}
            placeholder={question.placeHolder ?? ''}
            required={(question.required ?? false) && !disabled}
            disabled={disabled}
            readOnly={disabled}
            pattern={
                question.validator ? question.validator.pattern : '[\\s\\S]*'
            }
            maxLength={question.maxCount}
            errorMsg={question.validator?.errorMsg}
            autoComplete={question.autoComplete ?? ''}
            style={{ maxWidth: '480px' }}
        ></FormTextInput>
    );
}
