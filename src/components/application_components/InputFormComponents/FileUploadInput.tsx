import { PrimitiveAtom, useAtom, WritableAtom } from 'jotai';
import { QuestionFileUploads } from '../types';
import { FileUpload } from '@/components/ui/FileUpload/FileUpload';

export function FileUploadInput({
    dataAtom,
}: {
    dataAtom:
        | PrimitiveAtom<QuestionFileUploads>
        | WritableAtom<QuestionFileUploads, [val: QuestionFileUploads], void>;
}) {
    const [question, setQuestion] = useAtom(dataAtom);
    return (
        <FileUpload
            id={question.questionId + ''}
            accept={question.allowedTypes?.join(',') || ''}
            allowMultiple={question.allowMultiple}
            maxSize={question.maxSize}
            onFileChange={(files) => {
                setQuestion({ ...question, fileList: files });
            }}
            required={question.required ?? false}
        />
    );
}
