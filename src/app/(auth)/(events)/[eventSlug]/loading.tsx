import { Skeleton } from '@/components/ui/skeleton';

export default function EventSlugLoading() {
    return (
        <div className="flex flex-col gap-6 md:gap-8">
            <div className="overflow-hidden rounded-xl border border-neutral-600/30 bg-neutral-900">
                <Skeleton className="h-24 w-full rounded-none" />
                <div className="space-y-4 p-5 md:p-6">
                    <Skeleton className="h-8 w-2/3 max-w-md" />
                    <Skeleton className="h-4 w-full max-w-2xl" />
                    <Skeleton className="h-4 w-4/5 max-w-xl" />
                    <div className="flex flex-wrap gap-3 pt-2">
                        <Skeleton className="h-9 w-32 rounded-lg" />
                        <Skeleton className="h-9 w-32 rounded-lg" />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-11 xl:gap-8">
                <div className="space-y-4 xl:col-span-6">
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
                <div className="xl:col-span-5">
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
                <div className="grid grid-cols-1 gap-6 xl:col-span-11 xl:grid-cols-2">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-48 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}
