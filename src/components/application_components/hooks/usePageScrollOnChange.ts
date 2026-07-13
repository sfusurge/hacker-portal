'use client';

import { type RefObject, useEffect } from 'react';
import { resetFormScroll } from '../formScroll';

export function usePageScrollOnChange(
    pageIndex: number,
    containerRef: RefObject<HTMLElement | null>,
    isMobile: boolean
) {
    useEffect(() => {
        resetFormScroll(containerRef.current, isMobile);
    }, [pageIndex, isMobile, containerRef]);
}
