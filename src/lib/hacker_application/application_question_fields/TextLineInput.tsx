'use client';

import { Label } from '@/components/ui/label';
import { QuestionTextLineInput } from '../types';
import { Input } from '@/components/ui/input';
import { useAtom, type Atom } from 'jotai';

export function TextLineInput({
  dataAtom,
}: {
  dataAtom: Atom<QuestionTextLineInput>;
}) {
  const [question, setQuestion] = useAtom(dataAtom);

  return (
    <div
      style={{
        width: 'fit-content',
      }}
    >
      <Label htmlFor="lineInput">{question.title}</Label>
      {question.description && <span>{question.description}</span>}
      <Input
        id="lineInput"
        type="text"
        placeholder={question.placeHolder ?? ''}
        required={question.required}
      ></Input>
    </div>
  );
}
