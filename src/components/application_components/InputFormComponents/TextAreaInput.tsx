import { PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import { QuestionTextAreaInput } from '../types';
import { FormTextArea } from '@/components/ui/formTextArea/FormTextArea';

export function TextAreaInput({
    dataAtom,
    disabled = false,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionTextAreaInput>
        | WritableAtom<QuestionTextAreaInput, [QuestionTextAreaInput], void>;
    disabled?: boolean;
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
            required={(question.required ?? false) && !disabled}
            disabled={disabled}
            readOnly={disabled}
            placeholder={question.placeHolder ?? ''}
            errorMsg={question.errorMsg}
        ></FormTextArea>
    );
}
