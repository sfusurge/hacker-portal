'use client';

import { useAtomValue } from 'jotai';
import type { PrimitiveAtom } from 'jotai';
import type { InputFormQuestion, QuestionMultipleChoice } from '../types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * alert or captions that render when a choice is selected, has alert or caption property
 */
export function ChoiceConditionalAlert({
    questionAtom,
    placement,
}: {
    questionAtom: PrimitiveAtom<InputFormQuestion>;
    placement: 'above-title' | 'below-fieldset';
}) {
    const question = useAtomValue(questionAtom);
    if (question.type !== 'multiple-choice') return null;

    const mc = question as QuestionMultipleChoice;
    const selected = mc.value;
    const choices = mc.choices;

    if (!selected) return null;
    const choice = choices.find((c) => c.data === selected);
    const alert = choice?.alert;
    if (!alert) return null;
    const alertPlacement = alert.placement ?? 'below-fieldset';
    if (alertPlacement !== placement) return null;

    if ((alert.presentation ?? 'alert') === 'caption') {
        return null;
    }

    const variant = alert.variant === 'info' ? 'info' : 'default';

    return (
        <Alert variant={variant} className="mb-4 max-w-[480px]">
            {alert.title && <AlertTitle>{alert.title}</AlertTitle>}
            <AlertDescription>{alert.description}</AlertDescription>
        </Alert>
    );
}
