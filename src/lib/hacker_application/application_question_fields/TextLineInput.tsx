'use client';

import { Label } from '@/components/ui/label';
import { QuestionTextLineInput } from '../types';
import { Input } from '@/components/ui/input';
import { atom, PrimitiveAtom, useAtom, type Atom } from 'jotai';
import { useCallback, useEffect, useMemo, useRef } from 'react';

export function TextLineInput({
    dataAtom,
}: {
    dataAtom: PrimitiveAtom<QuestionTextLineInput>;
}) {
    const [question, setQuestion] = useAtom(dataAtom);

    const inputRef = useRef<HTMLInputElement | null>(null);

    const validate = useCallback(() => {
        if (inputRef.current && question.validator) {
            inputRef.current.checkValidity();

            if (inputRef.current.validity.valid) {
                // if valid then update question value
                question.value = inputRef.current.value;
                setQuestion({ ...question });
            } else {
                if (question.validator.errorMsg) {
                    inputRef.current.setCustomValidity(
                        question.validator.errorMsg
                    );
                }
            }
        }
    }, [inputRef.current]);

    // use ReturnType to type of client/window, and Nodejs.
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>();

    return (
        <div
            style={{
                width: 'fit-content',
            }}
        >
            <Label htmlFor="lineInput">{question.title}</Label>
            {question.description && <span>{question.description}</span>}
            <Input
                ref={inputRef}
                id="lineInput"
                type="text"
                placeholder={question.placeHolder ?? ''}
                required={question.required}
                pattern={
                    question.validator
                        ? question.validator.pattern
                        : '[\\s\\S]*'
                }
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
        </div>
    );
}
