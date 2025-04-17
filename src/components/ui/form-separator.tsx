import React from 'react';
import { cn } from '@/lib/utils';

interface FormSeparatorProps {
    topSection?: React.ReactNode;
    bottomSection?: React.ReactNode;
    separatorText?: string;
    className?: string;
    flipSections?: boolean;
}

export function FormSeparator({
    topSection,
    bottomSection,
    separatorText = 'or',
    className,
    flipSections = false,
}: FormSeparatorProps) {
    const firstSection = flipSections ? bottomSection : topSection;
    const secondSection = flipSections ? topSection : bottomSection;

    return (
        <div className={cn('flex flex-col gap-3', className)}>
            {firstSection && (
                <div className="flex flex-col gap-2 text-white/60">
                    {firstSection}
                </div>
            )}

            <div className="my-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <hr className="w-full border-t border-neutral-600/60" />
                <span className="text-xs text-white/30">{separatorText}</span>
                <hr className="w-full border-t border-neutral-600/60" />
            </div>

            {secondSection && (
                <div className="flex flex-col gap-2 text-white/60">
                    {secondSection}
                </div>
            )}
        </div>
    );
}
