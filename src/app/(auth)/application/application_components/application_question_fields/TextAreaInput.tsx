import { PrimitiveAtom, useAtom } from 'jotai';
import { QuestionNumberInput, QuestionTextAreaInput } from '../types';
import { FormTextInput } from '@/components/ui/input/input';
import { FormTextArea } from '@/components/ui/formTextArea/FormTextArea';

export function TextAreaInput({
    dataAtom,
}: {
    dataAtom: PrimitiveAtom<QuestionTextAreaInput>;
}) {
    const [question, setQuestion] = useAtom(dataAtom);
    return (
        <FormTextArea
            lazy
            maxLength={question.maxCount ?? 100}
            defaultValue={question.value ?? ''}
            onLazyChange={(val) => {
                setQuestion({ ...question, value: val });
            }}
            required={question.required ?? false}
            placeholder={question.placeHolder ?? ''}
        ></FormTextArea>
    );
}
