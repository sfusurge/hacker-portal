import { PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import { QuestionTextAreaInput } from '../types';
import { FormTextArea } from '@/components/ui/formTextArea/FormTextArea';

export function TextAreaInput({
    dataAtom,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionTextAreaInput>
        | WritableAtom<QuestionTextAreaInput, [QuestionTextAreaInput], void>;
}) {
    const [question, setQuestion] = useAtom(dataAtom);
    return (
        <FormTextArea
            lazy
            maxLength={question.maxCount ?? 2000}
            defaultValue={question.value ?? ''}
            onLazyChange={(val) => {
                setQuestion({ ...question, value: val });
            }}
            required={question.required ?? false}
            placeholder={question.placeHolder ?? ''}
        ></FormTextArea>
    );
}
