import { Atom, atom, PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import { QuestionCheckBoxInput } from '../types';

import { CheckBoxWithLabel } from '@/components/ui/checkbox/checkboxWithLabel';

export function CheckBoxInput({
    dataAtom,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionCheckBoxInput>
        | WritableAtom<
              QuestionCheckBoxInput,
              [val: QuestionCheckBoxInput],
              void
          >;
}) {
    const [question, setQuestion] = useAtom(dataAtom);
    return (
        <CheckBoxWithLabel
            name={`checkbox-${question.questionId}`}
            required={question.required ?? false}
            checked={question.value ?? false}
            onChange={(e) => {
                setQuestion({ ...question, value: e.target.checked });
            }}
        >
            {question.label}
        </CheckBoxWithLabel>
    );
}
