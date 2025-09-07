import Image from 'next/image';

interface NotFoundProps {
    children?: any;
}

export default function StatisticsPage(props: NotFoundProps) {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-8">
            <Image
                src="/dashboard/messy-otters.webp"
                width={699}
                height={725}
                className="max-w-[320px]"
                alt="An otter has dropped their mint chocolate ice cream. They look distraught."
            ></Image>
            <div className="text-center text-white">
                <p className="text-brand-400 mb-2 text-sm font-semibold">
                    Gathering data...
                </p>
                <h1 className="mb-3 text-2xl leading-tight font-semibold text-balance text-white">
                    This page will be available closer to StormHacks 2025.
                </h1>
                <p className="text-base text-balance text-white/60">
                    Stormy and Sparky are currently working hard gathering
                    insights!
                </p>
            </div>
            {props.children}
        </div>
    );
}
