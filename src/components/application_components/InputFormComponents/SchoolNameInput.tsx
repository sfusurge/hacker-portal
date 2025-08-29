'use client';

import { type PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import type { QuestionSchoolName } from '../types';

import { SchoolOptions } from '@/components/ui/SchoolOptions/SchoolOptions';

export function SchoolNameInput({
    dataAtom,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionSchoolName>
        | WritableAtom<QuestionSchoolName, [QuestionSchoolName], void>;
}) {
    const [question, setQuestion] = useAtom(dataAtom);
    return (
        <SchoolOptions
            apiUrl={question.apiUrl}
            initialData={question.selection}
            onChange={(newSelection) =>
                setQuestion({ ...question, selection: newSelection })
            }
            required={question.required}
            readOnly={false}
            placeholder={question.title}
        />
    );
}
