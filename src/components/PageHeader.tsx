import { AnnouncementsButton } from '@/components/announcements/AnnouncementsButton';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export function PageHeader({
    title,
    className,
    showAnnouncements = true,
}: {
    title: ReactNode;
    className?: string;
    showAnnouncements?: boolean;
}) {
    return (
        <div className={cn('flex items-center justify-between', className)}>
            <h1 className="text-3xl font-semibold text-white">{title}</h1>
            {showAnnouncements ? <AnnouncementsButton /> : null}
        </div>
    );
}
