import { PrimitiveAtom, useAtom } from 'jotai';
import { QuestionCheckBoxInput, QuestionNumberInput } from '../types';
import { FormTextInput } from '@/components/ui/input/input';
import { CheckBoxWithLabel } from '@/components/ui/checkbox/checkboxWithLabel';

export function CheckBoxInput({
    dataAtom,
}: {
    dataAtom: PrimitiveAtom<QuestionCheckBoxInput>;
}) {
    const [question, setQuestion] = useAtom(dataAtom);
    return (
        <CheckBoxWithLabel
            name={question.label ?? ''}
            required={question.required ?? false}
            checked={question.value ?? false}
            onChange={(e) => {
                setQuestion({ ...question, value: e.target.checked });
            }}
        ></CheckBoxWithLabel>
    );
}
