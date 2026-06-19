import Image from 'next/image';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type FullPageInfoImageSize = 'default' | 'sm' | 'md';

const IMAGE_SIZE_CLASS: Record<FullPageInfoImageSize, string> = {
    default: 'w-full rounded-2xl md:max-w-100 lg:max-w-90',
    md: 'w-full max-w-64 rounded-2xl sm:max-w-72',
    sm: 'w-full max-w-44 rounded-2xl sm:max-w-48',
};

const IMAGE_DIMENSIONS: Record<
    FullPageInfoImageSize,
    { width: number; height: number }
> = {
    default: { width: 320, height: 320 },
    md: { width: 288, height: 288 },
    sm: { width: 192, height: 192 },
};

interface Props {
    src: string;
    children?: ReactNode;
    title: string;
    body: string;
    imageSize?: FullPageInfoImageSize;
    imageAlt?: string;
}

export function FullPageInfo({
    src,
    children,
    title,
    body,
    imageSize = 'default',
    imageAlt = 'An otter has dropped their mint chocolate ice cream. They look distraught.',
}: Props) {
    const { width, height } = IMAGE_DIMENSIONS[imageSize];

    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-8">
            <Image
                src={src}
                width={width}
                height={height}
                className={cn(IMAGE_SIZE_CLASS[imageSize])}
                alt={imageAlt}
            />
            <div className="flex flex-col items-center gap-3 text-center">
                <p className="text-brand-400 text-sm font-semibold">{title}</p>
                <h1 className="mb-3 text-3xl leading-tight font-semibold text-balance text-white">
                    {body}
                </h1>
                {children}
            </div>
        </div>
    );
}
