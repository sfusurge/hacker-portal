'use client';

import { Label } from '@/components/ui/label/label';
import { QuestionTextLineInput } from '../types';
import { FormTextInput, Input } from '@/components/ui/input/input';
import { atom, PrimitiveAtom, useAtom, useSetAtom, type Atom } from 'jotai';
import { useCallback, useEffect, useMemo, useRef } from 'react';

export function TextLineInput({
    dataAtom,
}: {
    dataAtom: PrimitiveAtom<QuestionTextLineInput>;
}) {
    const [question, setQuestion] = useAtom(dataAtom);

    return (
        <FormTextInput
            type="search"
            lazy
            timeOut={500}
            onLazyChange={(newVal) => {
                setQuestion({ ...question, value: `${newVal}` });
            }}
            defaultValue={question.value}
            placeholder={question.placeHolder ?? ''}
            required={question.required}
            pattern={
                question.validator ? question.validator.pattern : '[\\s\\S]*'
            }
            maxLength={question.maxCount}
            errorMsg={question.validator?.errorMsg}
            autoComplete={question.autoComplete ?? ''}
            style={{ maxWidth: '400px' }}
        ></FormTextInput>
    );
}
