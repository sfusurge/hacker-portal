'use client';

import Link from 'next/link';
import {
    WindowIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface EmbedContainerProps {
    src: string;
    originalUrl: string;
    title: string;
    linkText: string;
    height?: string;
    allow?: string;
    sandbox?: string;
    className?: string;
}

export function EmbedContainer({
    src,
    originalUrl,
    title,
    linkText,
    height = 'h-[600px]',
    allow,
    sandbox = 'allow-scripts allow-same-origin allow-popups allow-forms',
    className = '',
}: EmbedContainerProps) {
    return (
        <div className={`w-full ${className}`}>
            <div className={`${height} w-full overflow-hidden rounded-lg`}>
                <iframe
                    src={src}
                    className="h-full w-full"
                    frameBorder="0"
                    allowFullScreen
                    title={title}
                    sandbox={sandbox}
                    allow={allow}
                />
            </div>
            <div className="mt-2">
                <Link
                    href={originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:text-brand-500 text-sm underline"
                >
                    {linkText}
                </Link>
            </div>
        </div>
    );
}

interface PreviewCardProps {
    url: string;
    title: string;
    description: string;
    buttonText: string;
    icon?: React.ReactNode;
    className?: string;
}

export function PreviewCard({
    url,
    title,
    description,
    buttonText,
    icon,
    className = '',
}: PreviewCardProps) {
    return (
        <div
            className={`w-full rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-center ${className}`}
        >
            {icon && <div className="mb-4">{icon}</div>}
            <h4 className="mb-2 text-lg font-medium text-neutral-900">
                {title}
            </h4>
            <p className="mb-4 text-sm text-white/60">{description}</p>
            <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-400 hover:bg-brand-500 inline-block rounded px-4 py-2 text-sm font-medium text-white transition-colors"
            >
                {buttonText}
            </Link>
        </div>
    );
}

function isValidUrl(string: string): boolean {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

export function IframeEmbed({ url }: { url: string }) {
    if (!isValidUrl(url)) {
        const errorIcon = (
            <ExclamationTriangleIcon className="text-danger-400 flex h-12 w-12 items-center justify-center" />
        );

        return (
            <div className="border-danger-200 bg-danger-50 w-full rounded-lg border p-6 text-center">
                <div className="mb-4">{errorIcon}</div>
                <h4 className="text-danger-900 mb-2 text-lg font-medium">
                    {url} is invalid.
                </h4>
                <p className="text-danger-600 text-sm">
                    The provided text is not a valid link. Please enter a valid
                    URL starting with http:// or https://
                </p>
            </div>
        );
    }

    const youtubeMatch = url.match(
        /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w\-]{11})/
    );

    if (youtubeMatch) {
        const videoId = youtubeMatch[1];
        return (
            <div className="aspect-video w-full">
                <iframe
                    className="h-full w-full rounded-lg"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    }

    const figmaMatch = url.match(
        /^(?:https?:\/\/)?(?:www\.)?figma\.com\/(file|proto|design)\/([a-zA-Z0-9]+)/
    );

    if (figmaMatch) {
        const embedUrl = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`;
        return (
            <EmbedContainer
                src={embedUrl}
                originalUrl={url}
                title="Figma Design"
                linkText="Open in Figma →"
            />
        );
    }

    const protopieMatch = url.match(
        /^(?:https?:\/\/)?(?:cloud\.)?protopie\.io\/p\/([a-zA-Z0-9]+)/
    );

    if (protopieMatch) {
        const prototypeId = protopieMatch[1];
        const embedUrl = `https://cloud.protopie.io/p/${prototypeId}?ui=false&scaleToFit=true&enableHotspotHints=true&cursorType=touch`;
        return (
            <EmbedContainer
                src={embedUrl}
                originalUrl={url}
                title="ProtoPie Prototype"
                linkText="Open ProtoPie prototype →"
                allow="accelerometer; gyroscope; microphone; camera"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock"
            />
        );
    }

    const balsamiqMatch = url.match(
        /^(?:https?:\/\/)?(?:balsamiq\.cloud|(?:[\w-]+\.)?balsamiq\.com)\/projects\/([a-zA-Z0-9]+)/
    );

    if (balsamiqMatch) {
        const wireframeIcon = (
            <WindowIcon className="h-12 w-12 text-white/60" />
        );

        return (
            <PreviewCard
                url={url}
                title="Balsamiq Wireframe"
                description="Click to view wireframe in Balsamiq"
                buttonText="Open Balsamiq Project →"
                icon={wireframeIcon}
            />
        );
    }

    const xdMatch = url.match(
        /^(?:https?:\/\/)?xd\.adobe\.com\/view\/([a-zA-Z0-9\-]+)/
    );

    if (xdMatch) {
        const projectId = xdMatch[1];
        return (
            <EmbedContainer
                src={`https://xd.adobe.com/embed/${projectId}/`}
                originalUrl={url}
                title="Adobe XD Prototype"
                linkText="Open in Adobe XD →"
            />
        );
    }

    return (
        <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-400 hover:text-brand-500 text-sm break-all underline"
        >
            {url}
        </Link>
    );
}
