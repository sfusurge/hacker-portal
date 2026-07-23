'use client';

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type MutableRefObject,
    type PointerEvent as ReactPointerEvent,
} from 'react';
import type { RowSelectionState, Table } from '@tanstack/react-table';
import type { Applicant } from './types';

const AUTO_SCROLL_EDGE_PX = 48;
const AUTO_SCROLL_MAX_SPEED = 28;

function isRowDragSelectBlocked(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false;
    return Boolean(
        target.closest(
            'button, a, input, textarea, select, label, [role="menuitem"], [data-radix-popper-content-wrapper], [data-no-row-drag]'
        )
    );
}

function getVerticalScrollParent(el: HTMLElement | null): HTMLElement | null {
    let node: HTMLElement | null = el;
    while (node) {
        const { overflowY } = getComputedStyle(node);
        if (
            (overflowY === 'auto' ||
                overflowY === 'scroll' ||
                overflowY === 'overlay') &&
            node.scrollHeight > node.clientHeight + 1
        ) {
            return node;
        }
        node = node.parentElement;
    }
    const scrolling = document.scrollingElement;
    return scrolling instanceof HTMLElement
        ? scrolling
        : document.documentElement;
}

function edgeScrollDelta(distanceIntoEdge: number, edgePx: number): number {
    if (distanceIntoEdge <= 0) return 0;
    const t = Math.min(1, distanceIntoEdge / edgePx);
    return Math.ceil(t * t * AUTO_SCROLL_MAX_SPEED);
}

type UseMarqueeRowSelectionArgs = {
    table: Table<Applicant>;
    rowSelection: RowSelectionState;
    setRowSelection: (
        updater:
            | RowSelectionState
            | ((prev: RowSelectionState) => RowSelectionState)
    ) => void;
    rowRefs: MutableRefObject<Map<string, HTMLTableRowElement>>;
    lastSelectionAnchorRef: MutableRefObject<number | null>;
    scrollContainerRef: MutableRefObject<HTMLElement | null>;
    marqueeOverlayRef: MutableRefObject<HTMLDivElement | null>;
};

export function useMarqueeRowSelection({
    table,
    rowSelection,
    setRowSelection,
    rowRefs,
    lastSelectionAnchorRef,
    scrollContainerRef,
    marqueeOverlayRef,
}: UseMarqueeRowSelectionArgs) {
    const [isMarqueeSelecting, setIsMarqueeSelecting] = useState(false);
    const marqueeSelectRef = useRef<{
        startX: number;
        startY: number;
        currentX: number;
        currentY: number;
        additive: boolean;
        baseSelection: RowSelectionState;
        startVisualIndex: number | null;
    } | null>(null);
    const autoScrollRafRef = useRef<number | null>(null);
    const paintRafRef = useRef<number | null>(null);
    // Keep latest table/selection in refs so pointer listeners stay stable.
    const tableRef = useRef(table);
    const rowSelectionRef = useRef(rowSelection);
    tableRef.current = table;
    rowSelectionRef.current = rowSelection;

    const paintMarqueeOverlay = useCallback(() => {
        paintRafRef.current = null;
        const drag = marqueeSelectRef.current;
        const el = marqueeOverlayRef.current;
        if (!drag || !el) return;

        const boundsEl =
            scrollContainerRef.current?.closest('[data-marquee-bounds]') ??
            scrollContainerRef.current;
        const bounds = boundsEl?.getBoundingClientRect();
        if (!bounds) return;

        const rawLeft = Math.min(drag.startX, drag.currentX);
        const rawTop = Math.min(drag.startY, drag.currentY);
        const rawRight = Math.max(drag.startX, drag.currentX);
        const rawBottom = Math.max(drag.startY, drag.currentY);

        // Keep the visible marquee inside the table shell.
        const left = Math.max(rawLeft, bounds.left) - bounds.left;
        const top = Math.max(rawTop, bounds.top) - bounds.top;
        const right = Math.min(rawRight, bounds.right) - bounds.left;
        const bottom = Math.min(rawBottom, bounds.bottom) - bounds.top;
        const width = Math.max(0, right - left);
        const height = Math.max(0, bottom - top);

        el.style.transform = `translate3d(${left}px, ${top}px, 0)`;
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
    }, [marqueeOverlayRef, scrollContainerRef]);

    const schedulePaintMarquee = useCallback(() => {
        if (paintRafRef.current != null) return;
        paintRafRef.current = requestAnimationFrame(paintMarqueeOverlay);
    }, [paintMarqueeOverlay]);

    const applyRowRangeSelection = useCallback(
        (
            fromIndex: number,
            toIndex: number,
            additive: boolean,
            baseSelection: RowSelectionState
        ) => {
            const rows = tableRef.current.getRowModel().rows;
            if (rows.length === 0) return;

            const start = Math.max(0, Math.min(fromIndex, toIndex));
            const end = Math.min(rows.length - 1, Math.max(fromIndex, toIndex));
            const next: RowSelectionState = additive
                ? { ...baseSelection }
                : {};
            for (let i = start; i <= end; i++) {
                next[rows[i].id] = true;
            }
            setRowSelection(next);
        },
        [setRowSelection]
    );

    const selectRowsIntersectingRect = useCallback(
        (
            box: { left: number; top: number; right: number; bottom: number },
            additive: boolean,
            baseSelection: RowSelectionState
        ) => {
            const rows = tableRef.current.getRowModel().rows;
            const next: RowSelectionState = additive
                ? { ...baseSelection }
                : {};
            let lastIndex: number | null = null;

            // Rows are visually ordered top→bottom; stop once past the marquee.
            for (let i = 0; i < rows.length; i++) {
                const el = rowRefs.current.get(rows[i].id);
                if (!el) continue;
                const rect = el.getBoundingClientRect();
                if (rect.bottom < box.top) continue;
                if (rect.top > box.bottom) break;
                const intersects =
                    rect.left < box.right &&
                    rect.right > box.left &&
                    rect.top < box.bottom &&
                    rect.bottom > box.top;
                if (!intersects) continue;
                next[rows[i].id] = true;
                lastIndex = i;
            }

            setRowSelection(next);
            if (lastIndex != null) {
                lastSelectionAnchorRef.current = lastIndex;
            }
        },
        [lastSelectionAnchorRef, rowRefs, setRowSelection]
    );

    const stopAutoScroll = useCallback(() => {
        if (autoScrollRafRef.current != null) {
            cancelAnimationFrame(autoScrollRafRef.current);
            autoScrollRafRef.current = null;
        }
    }, []);

    const tickAutoScroll = useCallback(() => {
        const drag = marqueeSelectRef.current;
        if (!drag) {
            autoScrollRafRef.current = null;
            return;
        }

        const container = scrollContainerRef.current;
        let deltaX = 0;
        let deltaY = 0;
        let nearEdge = false;

        if (container) {
            const rect = container.getBoundingClientRect();
            const leftEdge = rect.left + AUTO_SCROLL_EDGE_PX - drag.currentX;
            const rightEdge =
                drag.currentX - (rect.right - AUTO_SCROLL_EDGE_PX);
            const leftDelta = edgeScrollDelta(leftEdge, AUTO_SCROLL_EDGE_PX);
            const rightDelta = edgeScrollDelta(rightEdge, AUTO_SCROLL_EDGE_PX);
            nearEdge = nearEdge || leftEdge > 0 || rightEdge > 0;

            if (leftDelta > 0 || rightDelta > 0) {
                const before = container.scrollLeft;
                container.scrollLeft += rightDelta - leftDelta;
                deltaX += container.scrollLeft - before;
            }
        }

        const verticalParent = getVerticalScrollParent(container);
        if (verticalParent) {
            const rect = verticalParent.getBoundingClientRect();
            const topEdge = rect.top + AUTO_SCROLL_EDGE_PX - drag.currentY;
            const bottomEdge =
                drag.currentY - (rect.bottom - AUTO_SCROLL_EDGE_PX);
            const topDelta = edgeScrollDelta(topEdge, AUTO_SCROLL_EDGE_PX);
            const bottomDelta = edgeScrollDelta(
                bottomEdge,
                AUTO_SCROLL_EDGE_PX
            );
            nearEdge = nearEdge || topEdge > 0 || bottomEdge > 0;

            if (topDelta > 0 || bottomDelta > 0) {
                const before = verticalParent.scrollTop;
                verticalParent.scrollTop += bottomDelta - topDelta;
                deltaY += verticalParent.scrollTop - before;
            }
        }

        if (deltaX !== 0 || deltaY !== 0) {
            // Keep the marquee origin anchored to content as the viewport scrolls.
            drag.startX -= deltaX;
            drag.startY -= deltaY;
            schedulePaintMarquee();
        }

        if (nearEdge) {
            autoScrollRafRef.current = requestAnimationFrame(tickAutoScroll);
        } else {
            autoScrollRafRef.current = null;
        }
    }, [schedulePaintMarquee, scrollContainerRef]);

    const startAutoScroll = useCallback(() => {
        if (autoScrollRafRef.current != null) return;
        autoScrollRafRef.current = requestAnimationFrame(tickAutoScroll);
    }, [tickAutoScroll]);

    const handleRowPointerDown = useCallback(
        (event: ReactPointerEvent<HTMLTableRowElement>, rowIndex: number) => {
            if (event.button !== 0 || isRowDragSelectBlocked(event.target)) {
                return;
            }

            const additive = event.metaKey || event.ctrlKey;
            const extendRange = event.shiftKey;
            const selection = rowSelectionRef.current;

            if (extendRange && lastSelectionAnchorRef.current != null) {
                event.preventDefault();
                applyRowRangeSelection(
                    lastSelectionAnchorRef.current,
                    rowIndex,
                    additive,
                    selection
                );
                lastSelectionAnchorRef.current = rowIndex;
                return;
            }

            event.preventDefault();
            marqueeSelectRef.current = {
                startX: event.clientX,
                startY: event.clientY,
                currentX: event.clientX,
                currentY: event.clientY,
                additive,
                baseSelection: additive ? { ...selection } : {},
                startVisualIndex: rowIndex,
            };
            setIsMarqueeSelecting(true);
            // Paint after the overlay mounts.
            requestAnimationFrame(() => {
                schedulePaintMarquee();
            });
            startAutoScroll();
        },
        [
            applyRowRangeSelection,
            lastSelectionAnchorRef,
            schedulePaintMarquee,
            startAutoScroll,
        ]
    );

    useEffect(() => {
        const onPointerMove = (event: PointerEvent) => {
            const drag = marqueeSelectRef.current;
            if (!drag) return;
            drag.currentX = event.clientX;
            drag.currentY = event.clientY;
            schedulePaintMarquee();
            startAutoScroll();
        };

        const onPointerUp = () => {
            const drag = marqueeSelectRef.current;
            if (!drag) return;

            stopAutoScroll();
            if (paintRafRef.current != null) {
                cancelAnimationFrame(paintRafRef.current);
                paintRafRef.current = null;
            }

            const left = Math.min(drag.startX, drag.currentX);
            const top = Math.min(drag.startY, drag.currentY);
            const width = Math.abs(drag.currentX - drag.startX);
            const height = Math.abs(drag.currentY - drag.startY);
            const moved = width >= 4 || height >= 4;

            marqueeSelectRef.current = null;
            setIsMarqueeSelecting(false);

            // Tap / click without a drag should not change selection
            // (use the checkbox or shift-click for that).
            if (!moved) return;

            const boundsEl =
                scrollContainerRef.current?.closest('[data-marquee-bounds]') ??
                scrollContainerRef.current;
            const bounds = boundsEl?.getBoundingClientRect();
            const box = bounds
                ? {
                      left: Math.max(left, bounds.left),
                      top: Math.max(top, bounds.top),
                      right: Math.min(left + width, bounds.right),
                      bottom: Math.min(top + height, bounds.bottom),
                  }
                : {
                      left,
                      top,
                      right: left + width,
                      bottom: top + height,
                  };

            if (box.right <= box.left || box.bottom <= box.top) return;

            selectRowsIntersectingRect(box, drag.additive, drag.baseSelection);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);
        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointercancel', onPointerUp);
            stopAutoScroll();
            if (paintRafRef.current != null) {
                cancelAnimationFrame(paintRafRef.current);
                paintRafRef.current = null;
            }
        };
    }, [
        lastSelectionAnchorRef,
        schedulePaintMarquee,
        scrollContainerRef,
        selectRowsIntersectingRect,
        startAutoScroll,
        stopAutoScroll,
    ]);

    return {
        isMarqueeSelecting,
        handleRowPointerDown,
    };
}
