import { Button } from '@/components/ui/button';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import Image from 'next/image';
import ApplicationPageComponent from '@/app/(auth)/application/ApplicationPage';

export default async function ApplicationPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    const currentTime = dayjs();
    const cutoffTime = dayjs
        .tz('2025-05-30', 'Canada/Pacific')
        .startOf('day')
        .add(1, 'hour');
    const params = await searchParams;

    const bypass =
        process.env.APPLY_BYPASS &&
        params['appbypass'] === process.env.APPLY_BYPASS;

    if (currentTime.isAfter(cutoffTime) && !bypass) {
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

    return <ApplicationPageComponent />;
}
