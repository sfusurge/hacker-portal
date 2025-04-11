'use client';

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardHeaderColumn,
    CardHeaderDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ApplicationCardSkeleton() {
    return (
        <Card className="col-span-7 h-full">
            <CardHeader>
                <CardHeaderColumn>
                    <CardHeaderDescription>
                        Your Application Status
                    </CardHeaderDescription>
                    <Skeleton className="h-7 w-48" />
                </CardHeaderColumn>
                <Skeleton className="h-9 w-24" />
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-between gap-6 md:flex-row">
                <div className="flex w-full flex-col gap-4">
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-2/3" />
                </div>
                <div className="flex items-center justify-center">
                    <Skeleton className="aspect-square h-48 w-48 rounded-full" />
                </div>
            </CardContent>
            <CardFooter>
                <Skeleton className="h-9 w-full" />
            </CardFooter>
        </Card>
    );
}

export function TeamCardSkeleton() {
    return (
        <Card className="col-span-4 h-full">
            <CardHeader>
                <CardHeaderColumn>
                    <CardHeaderDescription>Your Team</CardHeaderDescription>
                    <Skeleton className="h-7 w-48" />
                </CardHeaderColumn>
            </CardHeader>
            <CardContent className="gap-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-7 w-7 rounded-full" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                        <Skeleton className="h-6 w-28 rounded-full" />
                    </div>
                ))}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <div className="flex w-full items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex w-full gap-3">
                    <Skeleton className="h-9 flex-grow" />
                    <Skeleton className="h-9 w-24" />
                </div>
            </CardFooter>
        </Card>
    );
}
