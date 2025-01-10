import { PrimitiveAtom, useAtom } from 'jotai';
import { QuestionCheckBoxInput, QuestionNumberInput } from '../types';
import { FormTextInput } from '@/components/ui/input/input';
import { CheckBoxWithLabel } from '@/components/ui/checkbox/checkbox';

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
            defaultChecked={question.value ?? false}
            onChange={(e) => {
                setQuestion({ ...question, value: e.target.checked });
            }}
        ></CheckBoxWithLabel>
    );
}
