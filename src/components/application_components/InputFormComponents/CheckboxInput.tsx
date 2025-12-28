import { PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
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
    const hasHtml =
        question.label?.includes('<') && question.label?.includes('>');
    return (
        <CheckBoxWithLabel
            name={question.label}
            required={question.required ?? false}
            checked={question.value ?? false}
            renderHtml={hasHtml}
            onChange={(e) => {
                setQuestion({
                    ...question,
                    questionId: question.questionId,
                    value: e.target.checked,
                });
            }}
        />
    );
}
