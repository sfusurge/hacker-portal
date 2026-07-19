import type { PageFormState } from './PageStatus/ApplicationPageIndicator';
import { canAdvanceFromPageState } from './InputFormComponents/shared';

export type PendingNavAction = 'next' | 'review';

export type NavigationResult =
    | { ok: true; nextIndex: number }
    | {
          ok: false;
          toast: 'incomplete' | 'invalid';
          focusPage: number;
          nextIndex?: number;
      };

export const FORM_NAV_TOAST = {
    incomplete: {
        title: 'Incomplete section',
        description:
            'Answer all required questions on this page before continuing.',
        variant: 'error' as const,
    },
    invalid: {
        title: 'Invalid form',
        description: 'Some of the questions are not filled correctly.',
        variant: 'error' as const,
    },
};

export function resolveNavigation(
    action: PendingNavAction,
    index: number,
    pageStates: PageFormState[],
    pageCount: number
): NavigationResult {
    if (action === 'next') {
        const current = pageStates[index];
        if (!current || !canAdvanceFromPageState(current)) {
            return { ok: false, toast: 'incomplete', focusPage: index };
        }
        return { ok: true, nextIndex: index + 1 };
    }

    let idx = 0;
    while (
        idx < pageStates.length &&
        canAdvanceFromPageState(pageStates[idx])
    ) {
        idx++;
    }
    if (idx < pageStates.length) {
        return {
            ok: false,
            toast: 'invalid',
            focusPage: idx,
            nextIndex: idx,
        };
    }
    return { ok: true, nextIndex: pageCount };
}

export function queuePendingNav(run: () => void) {
    requestAnimationFrame(() => setTimeout(run, 0));
}
