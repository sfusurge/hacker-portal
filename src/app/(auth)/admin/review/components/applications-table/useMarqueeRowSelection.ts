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

function isRowDragSelectBlocked(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false;
    return Boolean(
        target.closest(
            'button, a, input, textarea, select, label, [role="menuitem"], [data-radix-popper-content-wrapper], [data-no-row-drag]'
        )
    );
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
};

export function useMarqueeRowSelection({
    table,
    rowSelection,
    setRowSelection,
    rowRefs,
    lastSelectionAnchorRef,
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
        },
        [
            applyRowRangeSelection,
            lastSelectionAnchorRef,
            rowSelection,
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
        };

        const onPointerUp = () => {
            const drag = marqueeSelectRef.current;
            if (!drag) return;

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
        };
    }, [
        applyRowRangeSelection,
        lastSelectionAnchorRef,
        selectRowsIntersectingRect,
        updateMarqueeBox,
    ]);

    return {
        marqueeBox,
        isMarqueeSelecting: marqueeBox != null,
        handleRowPointerDown,
    };
}
