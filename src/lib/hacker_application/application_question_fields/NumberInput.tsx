import { PrimitiveAtom, useAtom } from 'jotai';
import { QuestionNumberInput } from '../types';
import { FormTextInput } from '@/components/ui/input/input';

export function NumberInput({
    dataAtom,
}: {
    dataAtom: PrimitiveAtom<QuestionNumberInput>;
}) {
    const [question, setQuestion] = useAtom(dataAtom);
    return (
        <FormTextInput
            type="number"
            lazy
            timeOut={500}
            required={question.required ?? false}
            min={question.min ?? -999}
            max={question.max ?? 999}
            placeholder={`${question.placeHolder ?? ''}`}
            autoComplete={question.autoComplete}
            defaultValue={question.value ?? ''}
            onLazyChange={(newVal) => {
                const intVal = parseInt(newVal as string);
                if (isNaN(intVal)) {
                    // reject bad input by setting value to undefined, but still trigger render
                    setQuestion({ ...question, value: undefined });
                } else {
                    setQuestion({ ...question, value: intVal });
                }
            }}
            errorMsg={question.errMsg}
        ></FormTextInput>
    );
}
