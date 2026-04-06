import type {
    InputFormPageData,
    QuestionInline,
} from '@/components/application_components/types';

/**
 * Flatten ids from the hackathon’s application form (DB / `applicationQuestionPages`).
 */
export function questionIdsInOrderFromPages(
    pages: InputFormPageData[] | undefined
): string[] {
    if (!pages?.length) return [];
    const ids: string[] = [];
    for (const section of pages) {
        if (!section.questions) continue;
        for (const q of section.questions) {
            if (q.type === 'inline') {
                const inline = q as QuestionInline;
                for (const c of inline.content ?? []) {
                    if (c.questionId != null) {
                        ids.push(String(c.questionId));
                    }
                }
            } else if (q.questionId != null) {
                ids.push(String(q.questionId));
            }
        }
    }
    return ids;
}
