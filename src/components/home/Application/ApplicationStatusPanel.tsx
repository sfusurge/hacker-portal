import Image from 'next/image';
import { ReactNode } from 'react';

const defaultIllustrationClassName = '-order-1 max-w-72 md:order-last';

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
 * shared layout for application status cards: left text column + optional illustration.
 */
export function ApplicationStatusPanel({
    children,
    illustration,
}: ApplicationStatusPanelProps) {
    return (
        <>
            <div
                className={
                    'flex flex-1 flex-col items-start justify-center gap-3 self-stretch pt-4 pr-0 text-start md:gap-5'
                }
            >
                {children}
            </div>
            {illustration ? (
                <Image
                    src={illustration.src}
                    width={illustration.width}
                    height={illustration.height}
                    alt={illustration.alt}
                    className={
                        illustration.className ?? defaultIllustrationClassName
                    }
                />
            ) : null}
        </>
    );
}
