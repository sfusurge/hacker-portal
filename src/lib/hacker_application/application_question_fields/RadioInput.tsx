import { PrimitiveAtom, useAtom } from 'jotai';
import { QuestionMultipleChoice } from '../types';
import { RadioButtonGroup } from '@/components/ui/radioButtonGroup/radioButtonGroup';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/strike/typography';

export function RadioInput({
    dataAtom,
}: {
    dataAtom: PrimitiveAtom<QuestionMultipleChoice>;
}) {
    const [question, setQuestion] = useAtom(dataAtom);
    return (
        <RadioButtonGroup
            options={question.choices}
            allowCustomInput={question.allowCustom ?? false}
            allowDeselect={question.allowDeselect ?? false}
            defaultSelection={question.value}
            required={question.required ?? false}
            onSelection={(newVal) => {
                setQuestion({ ...question, value: newVal });
            }}
        ></RadioButtonGroup>
    );
}
