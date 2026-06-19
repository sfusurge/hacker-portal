import { PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import { QuestionCheckBoxInput } from '../types';
import { CheckBoxWithLabel } from '@/components/ui/checkbox/checkboxWithLabel';

export function CheckBoxInput({
    dataAtom,
    disabled = false,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionCheckBoxInput>
        | WritableAtom<
              QuestionCheckBoxInput,
              [val: QuestionCheckBoxInput],
              void
          >;
    disabled?: boolean;
}) {
    const [question, setQuestion] = useAtom(dataAtom);
    const hasHtml =
        question.label?.includes('<') && question.label?.includes('>');
    return (
        <CheckBoxWithLabel
            name={question.label}
            required={(question.required ?? false) && !disabled}
            checked={question.value ?? false}
            disabled={disabled}
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
