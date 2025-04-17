import Image from 'next/image';

interface NotFoundProps {
    children?: any;
}

export default function NotFound(props: NotFoundProps) {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-8">
            <Image
                src="/login/sad-otter.webp"
                width={699}
                height={725}
                className="max-w-[240px]"
                alt="An otter has dropped their mint chocolate ice cream. They look distraught."
            ></Image>
            <div className="text-center text-white">
                <p className="text-brand-400 mb-2 text-sm font-semibold">
                    Error 404
                </p>
                <h1 className="mb-3 text-3xl leading-tight font-semibold text-balance text-white">
                    This page doesn&apos;t seem to exist.
                </h1>
                <p className="text-base text-balance text-white/60">
                    Maybe Stormy and Sparky forgot to build it. Or they ate it.
                </p>
            </div>
            {props.children}
        </div>
    );
}
