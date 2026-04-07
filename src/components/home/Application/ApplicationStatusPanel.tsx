import Image from 'next/image';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ApplicationStatusPanelProps = {
    children: ReactNode;
    illustration?: {
        src: string;
        width: number;
        height: number;
        alt: string;
        className?: string;
    };
};

/**
 * layout for application status cards: left text column + optional illustration.
 */
export function ApplicationStatusPanel({
    children,
    illustration,
}: ApplicationStatusPanelProps) {
    return (
        <>
            <div
                className={
                    'flex min-w-[240px] flex-1 flex-col items-start justify-center gap-3 self-stretch pt-4 pr-0 text-start md:gap-5'
                }
            >
                {children}
            </div>
            {illustration ? (
                <div
                    className={cn(
                        '-order-1 flex min-w-0 shrink justify-center self-center md:order-last md:self-center',
                        'w-full max-w-72'
                    )}
                >
                    <Image
                        src={illustration.src}
                        width={illustration.width}
                        height={illustration.height}
                        alt={illustration.alt}
                        className={cn(
                            'h-auto w-full object-contain',
                            illustration.className
                        )}
                    />
                </div>
            ) : null}
        </>
    );
}
