'use client';

import { Label } from '@/components/ui/label';
import { QuestionTextLineInput } from '../types';
import { Input } from '@/components/ui/input';
import { atom, PrimitiveAtom, useAtom, useSetAtom, type Atom } from 'jotai';
import { useCallback, useEffect, useMemo, useRef } from 'react';

export function TextLineInput({
    dataAtom,
    errorAtom,
}: {
    dataAtom: PrimitiveAtom<QuestionTextLineInput>;
    errorAtom: PrimitiveAtom<string | undefined>;
}) {
    const [question, setQuestion] = useAtom(dataAtom);
    const setError = useSetAtom(errorAtom);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // use ReturnType to type of client/window, and Nodejs.
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>();

    const validate = useCallback(() => {
        if (!inputRef.current) {
            return;
        }

        if (timer.current) {
            clearTimeout(timer.current);
        }

        if (question.validator) {
            inputRef.current.setCustomValidity('');
            inputRef.current.checkValidity();
        }

        console.log(question.validator, inputRef.current.validity);

        if (inputRef.current.validity.valid) {
            // if valid then update question value
            question.value = inputRef.current.value;
            setQuestion({ ...question });
            setError(undefined);
        } else {
            if (question.validator?.errorMsg) {
                inputRef.current.setCustomValidity(question.validator.errorMsg);
            }
        }
    }, [inputRef.current]);

    return (
        <Input
            ref={inputRef}
            type="text"
            defaultValue={question.value}
            placeholder={question.placeHolder ?? ''}
            required={question.required}
            pattern={
                question.validator ? question.validator.pattern : '[\\s\\S]*'
            }
            maxLength={question.maxCount ?? 9999}
            onKeyDown={(e) => {
                if (e.key === 'enter') {
                    validate();
                }
            }}
            onBlur={() => {
                validate();
            }}
            onChange={() => {
                // trigger validation after 500ms pause of typing.
                if (timer.current !== undefined) {
                    clearTimeout(timer.current);
                }

                timer.current = setTimeout(() => {
                    // after 500ms of not typing, validate and disable timer.
                    validate();
                    timer.current = undefined;
                }, 500);
            }}
        ></Input>
    );
}
