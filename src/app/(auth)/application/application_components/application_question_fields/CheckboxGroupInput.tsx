import { PrimitiveAtom, useAtom } from 'jotai';
import { QuestionMultipleCheckBox } from '../types';

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
            onSelection={(selelect, other) => {
                setQuestion({
                    ...question,
                    otherValue: other,
                    choices: question.choices.map((item) => ({
                        ...item,
                        value: selelect.has(item.data),
                    })),
                });
            }}
            allowOther={question.allowOther}
            otherValue={question.otherValue}
        ></CheckboxGroup>
    );
}
