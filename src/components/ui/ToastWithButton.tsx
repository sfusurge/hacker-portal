'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export type ToastWithButtonPlacement = 'absolute' | 'fixed';
export type ToastWithButtonOrientation = 'horizontal' | 'vertical';

export type ToastWithButtonProps = {
    open: boolean;
    message: React.ReactNode;
    actionLabel: React.ReactNode;
    onAction: () => void;
    placement?: ToastWithButtonPlacement;
    orientation?: ToastWithButtonOrientation;
    className?: string;
};

/**
 * compact floating "toast" pill — message + single action button — that slides up from the bottom of its positioning ancestor and fades out on dismiss.
 * behaviour:
 * - slides up from the bottom of its positioning ancestor and fades out on dismiss.
 * - message is centered horizontally and vertically.
 * - action button is centered horizontally and vertically.
 */
export function ToastWithButton({
    open,
    message,
    actionLabel,
    onAction,
    placement = 'absolute',
    orientation = 'horizontal',
    className,
}: ToastWithButtonProps) {
    const isVertical = orientation === 'vertical';
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const pill = (
        <AnimatePresence>
            {open ? (
                <motion.div
                    key="toast-with-button"
                    initial={{ opacity: 0, y: 24, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: 24, x: '-50%' }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className={cn(
                        'bg-neutral-850 pointer-events-none bottom-6 left-1/2 z-30 flex gap-3 rounded-xl border border-neutral-600/60 p-4 shadow-lg',
                        isVertical
                            ? 'w-max flex-col items-stretch text-center'
                            : 'w-max items-center',
                        placement === 'fixed' ? 'fixed' : 'absolute',
                        className
                    )}
                >
                    <span
                        className={cn(
                            'text-sm text-white/85',
                            !isVertical && 'text-nowrap'
                        )}
                    >
                        {message}
                    </span>
                    <Button
                        type="button"
                        variant="brand"
                        hierarchy="primary"
                        size="compact"
                        className={cn(
                            'pointer-events-auto shrink-0',
                            isVertical && 'w-full'
                        )}
                        onClick={onAction}
                    >
                        {actionLabel}
                    </Button>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );

    if (placement === 'fixed') {
        return mounted ? createPortal(pill, document.body) : null;
    }

    return pill;
}

export default ToastWithButton;
