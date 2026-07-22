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

export type MarqueeBox = {
    left: number;
    top: number;
    width: number;
    height: number;
};

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
};

export function useMarqueeRowSelection({
    table,
    rowSelection,
    setRowSelection,
    rowRefs,
    lastSelectionAnchorRef,
    scrollContainerRef,
}: UseMarqueeRowSelectionArgs) {
    const [marqueeBox, setMarqueeBox] = useState<MarqueeBox | null>(null);
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

    const applyRowRangeSelection = useCallback(
        (
            fromIndex: number,
            toIndex: number,
            additive: boolean,
            baseSelection: RowSelectionState
        ) => {
            const rows = table.getRowModel().rows;
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
        [setRowSelection, table]
    );

    const selectRowsIntersectingRect = useCallback(
        (
            box: { left: number; top: number; right: number; bottom: number },
            additive: boolean,
            baseSelection: RowSelectionState
        ) => {
            const rows = table.getRowModel().rows;
            const next: RowSelectionState = additive
                ? { ...baseSelection }
                : {};
            let lastIndex: number | null = null;

            rows.forEach((row, visualIndex) => {
                const el = rowRefs.current.get(row.id);
                if (!el) return;
                const rect = el.getBoundingClientRect();
                const intersects =
                    rect.left < box.right &&
                    rect.right > box.left &&
                    rect.top < box.bottom &&
                    rect.bottom > box.top;
                if (!intersects) return;
                next[row.id] = true;
                if (lastIndex == null || visualIndex > lastIndex) {
                    lastIndex = visualIndex;
                }
            });

            setRowSelection(next);
            if (lastIndex != null) {
                lastSelectionAnchorRef.current = lastIndex;
            }
        },
        [lastSelectionAnchorRef, rowRefs, setRowSelection, table]
    );

    const updateMarqueeBox = useCallback(
        (
            startX: number,
            startY: number,
            currentX: number,
            currentY: number
        ) => {
            setMarqueeBox({
                left: Math.min(startX, currentX),
                top: Math.min(startY, currentY),
                width: Math.abs(currentX - startX),
                height: Math.abs(currentY - startY),
            });
        },
        []
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

        if (container) {
            const rect = container.getBoundingClientRect();
            const leftEdge = rect.left + AUTO_SCROLL_EDGE_PX - drag.currentX;
            const rightEdge =
                drag.currentX - (rect.right - AUTO_SCROLL_EDGE_PX);
            const leftDelta = edgeScrollDelta(leftEdge, AUTO_SCROLL_EDGE_PX);
            const rightDelta = edgeScrollDelta(rightEdge, AUTO_SCROLL_EDGE_PX);

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
            updateMarqueeBox(
                drag.startX,
                drag.startY,
                drag.currentX,
                drag.currentY
            );
        }

        autoScrollRafRef.current = requestAnimationFrame(tickAutoScroll);
    }, [scrollContainerRef, updateMarqueeBox]);

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

            if (extendRange && lastSelectionAnchorRef.current != null) {
                event.preventDefault();
                applyRowRangeSelection(
                    lastSelectionAnchorRef.current,
                    rowIndex,
                    additive,
                    rowSelection
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
                baseSelection: additive ? { ...rowSelection } : {},
                startVisualIndex: rowIndex,
            };
            updateMarqueeBox(
                event.clientX,
                event.clientY,
                event.clientX,
                event.clientY
            );
            startAutoScroll();
        },
        [
            applyRowRangeSelection,
            lastSelectionAnchorRef,
            rowSelection,
            startAutoScroll,
            updateMarqueeBox,
        ]
    );

    useEffect(() => {
        const onPointerMove = (event: PointerEvent) => {
            const drag = marqueeSelectRef.current;
            if (!drag) return;
            drag.currentX = event.clientX;
            drag.currentY = event.clientY;
            updateMarqueeBox(
                drag.startX,
                drag.startY,
                drag.currentX,
                drag.currentY
            );
            startAutoScroll();
        };

        const onPointerUp = () => {
            const drag = marqueeSelectRef.current;
            if (!drag) return;

            stopAutoScroll();

            const left = Math.min(drag.startX, drag.currentX);
            const top = Math.min(drag.startY, drag.currentY);
            const width = Math.abs(drag.currentX - drag.startX);
            const height = Math.abs(drag.currentY - drag.startY);
            const moved = width >= 4 || height >= 4;

            marqueeSelectRef.current = null;
            setMarqueeBox(null);

            if (!moved) {
                if (drag.startVisualIndex != null) {
                    applyRowRangeSelection(
                        drag.startVisualIndex,
                        drag.startVisualIndex,
                        drag.additive,
                        drag.baseSelection
                    );
                    lastSelectionAnchorRef.current = drag.startVisualIndex;
                }
                return;
            }

            selectRowsIntersectingRect(
                {
                    left,
                    top,
                    right: left + width,
                    bottom: top + height,
                },
                drag.additive,
                drag.baseSelection
            );
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);
        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointercancel', onPointerUp);
            stopAutoScroll();
        };
    }, [
        applyRowRangeSelection,
        lastSelectionAnchorRef,
        selectRowsIntersectingRect,
        startAutoScroll,
        stopAutoScroll,
        updateMarqueeBox,
    ]);

    return {
        marqueeBox,
        isMarqueeSelecting: marqueeBox != null,
        handleRowPointerDown,
    };
}
