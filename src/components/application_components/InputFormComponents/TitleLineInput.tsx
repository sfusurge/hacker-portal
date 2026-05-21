'use client';

import { Label } from '@/components/ui/label/label';
import { QuestionTitleLineInput } from '../types';
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

export function TitleLineInput({
    dataAtom,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionTitleLineInput>
        | WritableAtom<QuestionTitleLineInput, [QuestionTitleLineInput], void>;
}) {
    const [question, setQuestion] = useAtom(dataAtom);

    const normalizedValue =
        typeof question.value === 'string' ? question.value : undefined;

    return (
        <FormTextInput
            type="text"
            lazy
            timeOut={500}
            onLazyChange={(newVal) => {
                setQuestion({ ...question, value: `${newVal}` });
            }}
            defaultValue={normalizedValue}
            placeholder={"Project's Name"}
            required={question.required}
            errorMsg={question.validator?.errorMsg}
            formatAsHeading
            style={{ maxWidth: '480px' }}
        ></FormTextInput>
    );
}
