'use client';

import { hackathonAtom } from '@/app/(auth)/ClientContext';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardHeaderColumn,
    CardHeaderDescription,
    CardHeaderTitle,
} from '@/components/ui/card';
import { useAtomValue } from 'jotai';
import Link from 'next/link';

export function ProjectGalleryCard() {
    const hackathon = useAtomValue(hackathonAtom);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardHeaderColumn>
                    <CardHeaderDescription className="leading-tight">
                        Project Gallery
                    </CardHeaderDescription>
                    <CardHeaderTitle>
                        {hackathon.hackathonName} projects
                    </CardHeaderTitle>
                </CardHeaderColumn>
            </CardHeader>

            <CardContent className="min-h-[250px] items-center justify-center gap-6 px-10 py-8 text-center">
                <p className="text-pretty text-white/60 lg:max-w-[550px]">
                    The project gallery is open! Browse every team&apos;s
                    submission and see what everyone built.
                </p>
                <Link href="/projects">
                    <Button variant="brand" size="cozy" hierarchy="primary">
                        View all projects
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
