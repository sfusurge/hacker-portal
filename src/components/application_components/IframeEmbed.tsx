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

const FIGMA_EMBED_FILE_TYPES = new Set([
    'design',
    'board',
    'proto',
    'slides',
    'deck',
]);

// https://developers.figma.com/docs/embeds/resources/
function toFigmaEmbedUrl(url: string): string | null {
    try {
        const parsed = new URL(url);
        if (!parsed.hostname.endsWith('figma.com')) {
            return null;
        }

        const pathMatch = parsed.pathname.match(
            /^\/([\w-]+)\/([0-9a-zA-Z]{22,128})/
        );
        if (!pathMatch) {
            return null;
        }

        let fileType = pathMatch[1];
        if (fileType === 'file') {
            parsed.pathname = parsed.pathname.replace(/^\/file\//, '/design/');
            fileType = 'design';
        }

        if (!FIGMA_EMBED_FILE_TYPES.has(fileType)) {
            return null;
        }

        parsed.hostname = 'embed.figma.com';

        const params = parsed.searchParams;
        if (!params.has('embed-host')) {
            params.set('embed-host', 'share');
        }
        if (params.has('node_id') && !params.has('node-id')) {
            params.set('node-id', params.get('node_id')!);
            params.delete('node_id');
        }

        return parsed.toString();
    } catch {
        return null;
    }
}

function figmaEmbedTitle(url: string): string {
    if (/\/deck\//.test(url) || /\/slides\//.test(url)) {
        return 'Figma Slides';
    }
    if (/\/board\//.test(url)) {
        return 'FigJam board';
    }
    if (/\/proto\//.test(url)) {
        return 'Figma prototype';
    }
    return 'Figma design';
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

    const figmaEmbedUrl = toFigmaEmbedUrl(url);

    if (figmaEmbedUrl) {
        return (
            <EmbedContainer
                src={figmaEmbedUrl}
                originalUrl={url}
                title={figmaEmbedTitle(url)}
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
