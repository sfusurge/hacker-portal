import Image from 'next/image';

interface NotFoundProps {
    children?: any;
}

export default function NotFound(props: NotFoundProps) {
    return (
        <div className="flex flex-col h-full w-full items-center justify-center gap-8">
            <Image
                src="/login/sad-otter.png"
                width={699}
                height={725}
                className="max-w-[240px]"
                alt="An otter has dropped their mint chocolate ice cream. They look distraught."
            ></Image>
            <div className="text-center text-white">
                <p className="font-semibold text-sm text-brand-400 mb-2">
                    Error 404
                </p>
                <h1 className="text-3xl font-semibold text-white text-balance leading-tight mb-3">
                    This page doesn't seem to exist.
                </h1>
                <p className="text-base text-balance text-white/60">
                    Maybe Stormy and Sparky forgot to build it. Or they ate it.
                </p>
            </div>
            {props.children}
        </div>
    );
}
