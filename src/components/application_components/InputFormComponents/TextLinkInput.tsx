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
}: {
    dataAtom:
        | PrimitiveAtom<QuestionTextLinkInput>
        | WritableAtom<QuestionTextLinkInput, [QuestionTextLinkInput], void>;
}) {
    const [question, setQuestion] = useAtom(dataAtom);

    const urlPattern =
        '^(https?:\\/\\/)?([\\w\\-]+\\.)+[\\w\\-]+(\\/[\\w\\-./?%&=]*)?$';

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
            pattern={question.validator?.pattern ?? urlPattern}
            maxLength={question.maxCount}
            errorMsg={
                question.validator?.errorMsg ?? 'Please enter a valid URL.'
            }
            autoComplete={question.autoComplete ?? ''}
            style={{ maxWidth: '400px' }}
        ></FormTextInput>
    );
}
