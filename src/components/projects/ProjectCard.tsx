'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Project {
    [key: number]: string;
}

interface StatusInfo {
    label: string;
    className: string;
}

interface ProjectCardProps {
    project: Project;
    index: number;
    statusInfo: StatusInfo;
    projectId?: string | number;
}

export default function ProjectCard({
    project,
    index,
    statusInfo,
    projectId,
}: ProjectCardProps) {
    const linkId = projectId !== undefined ? projectId : index;

    return (
        <Link
            href={`/projects/${linkId}`}
            className="group flex flex-col overflow-hidden rounded-xl transition-shadow hover:shadow-lg"
        >
            <div className="relative" title={project[1]}>
                <p
                    className={`${statusInfo.className} absolute top-3 left-3 rounded-xl px-3 py-1`}
                >
                    {statusInfo.label}
                </p>
                <Image
                    src="/hacker-portal-preview.webp"
                    alt={`Project: ${project[1]}`}
                    width={500}
                    height={281}
                    className="aspect-video w-full object-cover"
                />
                <div className="bg-neutral-850 flex h-full flex-col space-y-2 p-4 transition-colors group-hover:bg-neutral-800">
                    <h3 className="line-clamp-2 font-semibold text-pretty text-white">
                        {project[1]}
                    </h3>
                    <p className="line-clamp-2 text-sm text-white/60">
                        {project[2]}
                    </p>
                </div>
            </div>
        </Link>
    );
}
