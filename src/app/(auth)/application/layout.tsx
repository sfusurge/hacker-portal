import { Button } from '@/components/ui/button';
import dayjs from 'dayjs';
import Image from 'next/image';

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const currentTime = dayjs();
    const cutoffTime = dayjs(new Date(2025, 4, 1)).startOf('day');

    if (currentTime.isAfter(cutoffTime)) {
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
                        Application Closed!
                    </p>
                    <h1 className="mb-3 text-3xl leading-tight font-semibold text-balance text-white">
                        Unfortunately application for this event is closed, see
                        you next time!
                    </h1>
                </div>
                <Button
                    size="cozy"
                    variant="brand"
                    hierarchy="primary"
                    className="bg-brand-600 hover:bg-brand-700 text-white"
                >
                    <a href="/home">Return to home</a>
                </Button>
            </div>
        );
    }

    return <>{children}</>;
}
