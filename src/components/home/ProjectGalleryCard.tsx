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
import {
    getProjectGalleryOpenDate,
    isProjectsGalleryOpen,
} from '@/lib/submissionWindow';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const GALLERY_PHASE_TICK_MS = 10_000;

export function ProjectGalleryCard() {
    const hackathon = useAtomValue(hackathonAtom);
    const [galleryOpen, setGalleryOpen] = useState(false);

    const projectGalleryOpen = hackathon.projectGalleryOpen?.toDate() ?? null;
    const submissionDeadline = hackathon.submissionDeadline.toDate();
    const galleryOpensAt = dayjs(
        getProjectGalleryOpenDate(projectGalleryOpen, submissionDeadline)
    );

    useEffect(() => {
        const update = () => {
            setGalleryOpen(
                isProjectsGalleryOpen(
                    Date.now(),
                    projectGalleryOpen,
                    submissionDeadline
                )
            );
        };

        update();
        const interval = setInterval(update, GALLERY_PHASE_TICK_MS);
        return () => clearInterval(interval);
    }, [projectGalleryOpen, submissionDeadline]);

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
                {galleryOpen ? (
                    <p className="text-pretty text-white/60 lg:max-w-[550px]">
                        The project gallery is open! Browse every team&apos;s
                        submission and see what everyone built.
                    </p>
                ) : (
                    <p className="text-pretty text-white/60 lg:max-w-[550px]">
                        The project gallery opens on{' '}
                        {galleryOpensAt.format('MMM D, YYYY h:mm A')}.
                    </p>
                )}
                <Link href="/projects">
                    <Button variant="brand" size="cozy" hierarchy="primary">
                        View all projects
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
