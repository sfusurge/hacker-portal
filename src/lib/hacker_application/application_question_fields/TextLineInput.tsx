'use client';

import { Label } from '@/components/ui/label';
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
            type="text"
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
            maxLength={question.maxCount ?? 9999}
        ></FormTextInput>
    );
}
