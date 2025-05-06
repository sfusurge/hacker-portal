import Image from 'next/image';
import { ReactNode } from 'react';
interface Props {
    src: string;
    children: ReactNode;
    title: string;
    body: string;
}
export function FullPageInfo({ src, children, title, body }: Props) {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-8">
            <Image
                src={src}
                width={700}
                alt="An otter has dropped their mint chocolate ice cream. They look distraught."
            ></Image>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                }}
            >
                <p className="text-brand-400 mb-2 text-sm font-semibold">
                    {title}
                </p>
                <h1 className="mb-3 text-3xl leading-tight font-semibold text-balance text-white">
                    {body}
                </h1>
                {children}
            </div>
        </div>
    );
}
