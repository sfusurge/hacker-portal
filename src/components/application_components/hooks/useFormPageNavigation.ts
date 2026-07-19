'use client';

import { useEffect, useState } from 'react';
import { Atom, PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { toast } from '@/hooks/use-toast';
import {
    finalErrCheckAtom,
    focusInvalidOnPageAtom,
    validatedPagesAtom,
} from '../InputForm';
import {
    FORM_NAV_TOAST,
    PendingNavAction,
    queuePendingNav,
    resolveNavigation,
} from '../formNavigation';
import type { PageFormState } from '../PageStatus/ApplicationPageIndicator';

export function useFormPageNavigation({
    indexAtom,
    pageStatesAtom,
    pageCount,
}: {
    indexAtom: PrimitiveAtom<number>;
    pageStatesAtom: Atom<PageFormState[]>;
    pageCount: number;
}) {
    const [index, setIndex] = useAtom(indexAtom);
    const pageStates = useAtomValue(pageStatesAtom);
    const setErrCheck = useSetAtom(finalErrCheckAtom);
    const setValidatedPages = useSetAtom(validatedPagesAtom);
    const setFocusInvalidOnPage = useSetAtom(focusInvalidOnPageAtom);
    const [pendingNav, setPendingNav] = useState<PendingNavAction | null>(null);

    const queueNav = (action: PendingNavAction) => {
        if (action === 'review') setErrCheck(true);
        else {
            setValidatedPages((prev) =>
                prev.includes(index) ? prev : [...prev, index]
            );
        }
        queuePendingNav(() => setPendingNav(action));
    };

    useEffect(() => {
        if (!pendingNav) return;

        const result = resolveNavigation(
            pendingNav,
            index,
            pageStates,
            pageCount
        );
        if (!result.ok) {
            toast(FORM_NAV_TOAST[result.toast]);
            setFocusInvalidOnPage(result.focusPage);
            if (result.nextIndex != null) setIndex(result.nextIndex);
        } else {
            setIndex(result.nextIndex);
        }
        setPendingNav(null);
    }, [
        pendingNav,
        pageStates,
        index,
        pageCount,
        setIndex,
        setFocusInvalidOnPage,
    ]);

    return {
        index,
        setIndex,
        tryNext: () => queueNav('next'),
        tryReview: () => queueNav('review'),
    };
}
