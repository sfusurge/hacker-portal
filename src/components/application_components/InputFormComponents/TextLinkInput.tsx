'use client';

import { Label } from '@/components/ui/label/label';
import { QuestionTextLinkInput } from '../types';
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

export function TextLinkInput({
    dataAtom,
    disabled = false,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionTextLinkInput>
        | WritableAtom<QuestionTextLinkInput, [QuestionTextLinkInput], void>;
    disabled?: boolean;
}) {
    const [question, setQuestion] = useAtom(dataAtom);

    const urlPattern =
        "^(https?:\\/\\/)?(www\\.)?[a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.[a-zA-Z]{2,}(\\/[a-zA-Z0-9\\-._~:/?#\\[\\]@!$&'()*+,;=%]*)?$";

    const normalizedValue =
        typeof question.value === 'string' ? question.value : undefined;

    return (
        <FormTextInput
            type="search"
            lazy
            timeOut={1000}
            onLazyChange={(newVal) => {
                setQuestion({ ...question, value: `${newVal}` });
            }}
            defaultValue={normalizedValue}
            placeholder={question.placeHolder ?? ''}
            required={(question.required ?? false) && !disabled}
            disabled={disabled}
            readOnly={disabled}
            pattern={question.validator?.pattern ?? urlPattern}
            maxLength={question.maxCount}
            errorMsg={
                question.validator?.errorMsg ?? 'Please enter a valid URL.'
            }
            autoComplete={question.autoComplete ?? ''}
            style={{ maxWidth: '480px' }}
        ></FormTextInput>
    );
}
