'use client';

import { cn } from '@/lib/utils';
import styles from './MobileTopNav.module.css';

interface MobileTopNavProps {
    className?: string;
    hackathonName?: string;
    savedAt?: number | null;
}

function formatSavedTime(savedAt?: number | null): string {
    if (!savedAt) return '--';

    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(new Date(savedAt));
}

export function MobileTopNav({
    className,
    hackathonName,
    savedAt,
}: MobileTopNavProps) {
    return (
        <div className="md:hidden">
            <div
                className={cn(
                    'fixed inset-x-0 top-0 z-100 h-20 w-full min-w-0 border-b border-b-neutral-600/30 bg-neutral-900/60 px-[34px] py-5 backdrop-blur-xl',
                    className
                )}
            >
                <div className={styles.content}>
                    <h1 className={styles.title}>
                        Application to {hackathonName || 'Hackathon'}
                    </h1>
                    <p className={styles.description}>
                        Last saved {formatSavedTime(savedAt)}
                    </p>
                </div>
            </div>
            <div className="h-20" aria-hidden />
        </div>
    );
}
