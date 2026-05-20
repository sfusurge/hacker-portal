'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import slugify from '@/utils/slugify';
import type { ProjectListItem } from '@/lib/projects/projectSubmissionDisplay';

interface StatusInfo {
    label: string;
    className: string;
}

interface ProjectCardProps {
    project: ProjectListItem;
    statusInfo?: StatusInfo;
    isLoading?: boolean;
}

export default function ProjectCard({
    project,
    statusInfo,
    isLoading = false,
}: ProjectCardProps) {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const [titleLines, setTitleLines] = useState(1);
    const title = project.title;
    const tagline = project.tagline;
    const headerImage = project.headerImage || '/hacker-portal-preview.webp';

    useEffect(() => {
        const checkTitleHeight = () => {
            if (titleRef.current) {
                const titleHeight = titleRef.current.clientHeight;
                const lineHeight = parseInt(
                    window.getComputedStyle(titleRef.current).lineHeight
                );
                const estimatedLines = Math.round(titleHeight / lineHeight);
                setTitleLines(estimatedLines > 1 ? 2 : 1);
            }
        };

        checkTitleHeight();
        window.addEventListener('resize', checkTitleHeight);
        return () => window.removeEventListener('resize', checkTitleHeight);
    }, [project, title]);

    if (isLoading) {
        return (
            <div className="flex flex-col overflow-hidden rounded-xl">
                <div className="relative">
                    <Skeleton className="absolute top-3 left-3 h-6 w-24 rounded-xl" />
                    <Skeleton className="aspect-video w-full" />
                    <div className="bg-neutral-850 flex flex-col gap-2 p-4">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Link
            href={`/projects/${slugify(project.teamName)}`}
            className={`group flex flex-col overflow-hidden rounded-xl transition-shadow hover:shadow-lg ${
                statusInfo?.label === 'Not Judging' ? 'opacity-90' : ''
            }`}
        >
            <div className="relative" title={title}>
                {statusInfo && statusInfo.label && (
                    <p
                        className={`${statusInfo.className} absolute top-3 left-3 z-10 rounded-xl px-3 py-1`}
                    >
                        {statusInfo.label}
                    </p>
                )}
                <div
                    className={`${statusInfo?.label === 'Not Judging' ? 'opacity-90' : ''}`}
                >
                    <Image
                        src={headerImage}
                        alt={`Project: ${title}`}
                        width={500}
                        height={281}
                        className="aspect-video w-full object-cover"
                    />
                    <div className="bg-neutral-850 flex h-full min-h-28 flex-col gap-2 p-4 transition-colors group-hover:bg-neutral-800">
                        <h3
                            ref={titleRef}
                            className="mb-0 line-clamp-2 leading-tight font-semibold text-pretty text-white"
                        >
                            {title}
                        </h3>
                        <p
                            className={`${titleLines === 1 ? 'line-clamp-3' : 'line-clamp-2'} text-sm text-white/60`}
                        >
                            {tagline}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
