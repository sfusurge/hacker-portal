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
                width={320}
                height={320}
                className="w-full rounded-2xl md:max-w-100 lg:max-w-90"
                alt="An otter has dropped their mint chocolate ice cream. They look distraught."
            ></Image>
            <div className="flex flex-col gap-3">
                <p className="text-brand-400 text-sm font-semibold">{title}</p>
                <h1 className="mb-3 text-3xl leading-tight font-semibold text-balance text-white">
                    {body}
                </h1>
                {children}
            </div>
        </div>
    );
}
