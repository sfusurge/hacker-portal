'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import slugify from '@/utils/slugify';

interface Project {
    [key: number]: string;
    id: number;
    teamName: string;
}

interface StatusInfo {
    label: string;
    className: string;
}

interface ProjectCardProps {
    project: Project;
    statusInfo: StatusInfo;
    projectId: number;
    isLoading?: boolean;
}

export default function ProjectCard({
    project,
    statusInfo,
    projectId,
    isLoading = false,
}: ProjectCardProps) {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const [titleLines, setTitleLines] = useState(1);

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
    }, [project]);

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
            href={`/projects/${projectId}`}
            className="group flex flex-col overflow-hidden rounded-xl transition-shadow hover:shadow-lg"
        >
            <div className="relative" title={project[1]}>
                <p
                    className={`${statusInfo.className} absolute top-3 left-3 rounded-xl px-3 py-1`}
                >
                    {statusInfo.label}
                </p>
                <Image
                    src={project[3] || '/hacker-portal-preview.webp'}
                    alt={`Project: ${project[1]}`}
                    width={500}
                    height={281}
                    className="aspect-video w-full object-cover"
                />
                <div className="bg-neutral-850 flex flex-col gap-2 p-4 transition-colors group-hover:bg-neutral-800">
                    <h3
                        ref={titleRef}
                        className="mb-0 line-clamp-2 leading-tight font-semibold text-pretty text-white"
                    >
                        {project[1]}
                    </h3>
                    <p
                        className={`${titleLines === 1 ? 'line-clamp-3' : 'line-clamp-2'} text-sm text-white/60`}
                    >
                        {project[4]}
                    </p>
                </div>
            </div>
        </Link>
    );
}
