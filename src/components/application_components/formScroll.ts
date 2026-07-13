import { isQuestionApplicableOnForm } from '@/lib/projects/submissionFormQuestions';
import { isApplicationQuestionFilled } from './InputFormComponents/shared';
import type { InputFormQuestion } from './types';

function findFirstInvalidQuestionId(
    questions: InputFormQuestion[],
    siblings: InputFormQuestion[] = questions
): number | undefined {
    for (const q of questions) {
        if (!isQuestionApplicableOnForm(q, siblings)) continue;
        if (q.type === 'inline') {
            const id = findFirstInvalidQuestionId(q.content ?? []);
            if (id != null) return id;
        } else if (q.required && !isApplicationQuestionFilled(q)) {
            return q.questionId;
        }
    }
}

export function scrollToFirstInvalidInForm(
    form: HTMLFormElement | null,
    questions: InputFormQuestion[],
    scrollContainer?: HTMLElement | null
) {
    if (!form) return;
    form.reportValidity();

    const id = findFirstInvalidQuestionId(questions);
    const target =
        (id != null &&
            form.querySelector<HTMLElement>(
                `[data-question-id="${id}"], #${CSS.escape(String(id))}`
            )) ||
        form.querySelector<HTMLElement>(
            'input:invalid, textarea:invalid, select:invalid'
        );
    if (!target) return;

    const el = target.closest<HTMLElement>('[data-question-id]') ?? target;
    const offset = matchMedia('(max-width: 767.5px)').matches ? 88 : 24;
    let parent = scrollContainer ?? null;
    for (
        let node = el.parentElement;
        node && !parent;
        node = node.parentElement
    ) {
        const { overflowY } = getComputedStyle(node);
        if (
            (overflowY === 'auto' || overflowY === 'scroll') &&
            node.scrollHeight > node.clientHeight
        ) {
            parent = node;
        }
    }
    const top =
        (parent ? parent.scrollTop : window.scrollY) +
        el.getBoundingClientRect().top -
        (parent?.getBoundingClientRect().top ?? 0) -
        offset;
    (parent ?? window).scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

export function resetFormScroll(
    container: HTMLElement | null,
    isMobile: boolean
) {
    container?.scrollTo({ top: 0 });
    if (isMobile) {
        document.querySelector('main')?.scrollTo({ top: 0 });
    }
}
