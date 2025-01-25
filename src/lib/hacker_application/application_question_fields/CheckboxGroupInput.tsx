import { PrimitiveAtom, useAtom } from 'jotai';
import { QuestionCheckBoxInput, QuestionMultipleCheckBox } from '../types';

import { CheckBoxWithLabel } from '@/components/ui/checkbox/checkboxWithLabel';
import { CheckboxGroup } from '@/components/ui/checkboxGroup/CheckBoxGroup';

export function CheckBoxGroupInput({
    dataAtom,
}: {
    dataAtom: PrimitiveAtom<QuestionMultipleCheckBox>;
}) {
    const [question, setQuestion] = useAtom(dataAtom);
    return (
        <CheckboxGroup
            choices={question.choices}
            min={question.min ?? 1}
            max={question.max ?? 99}
            required={question.required ?? false}
            selected={question.choices
                .map((item) => (item.value ? item.data : undefined))
                .filter((item) => item !== undefined)}
            onSelection={(selelect) => {
                setQuestion({
                    ...question,
                    choices: question.choices.map((item) => ({
                        ...item,
                        value: selelect.has(item.data),
                    })),
                });
            }}
        ></CheckboxGroup>
    );
}
