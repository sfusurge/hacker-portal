'use client';

import { useState } from 'react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface PdfPreviewProps {
    url: string;
    name: string;
    // Thumbnail: cropped chrome, open-link on hover.
    thumbnail?: boolean;
}

export default function PdfPreview({
    url,
    name,
    thumbnail = true,
}: PdfPreviewProps) {
    const [iframeError, setIframeError] = useState(false);

    const googleEmbedUrl = `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(
        url
    )}&zoom=67`;

    if (iframeError) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
                <p className="text-xs text-white/60">Preview unavailable</p>
                <p className="text-xs text-white/45">Open profile to view</p>
            </div>
        );
    }

    if (!thumbnail) {
        return (
            <iframe
                src={googleEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title={`${name} Resume Preview`}
                onError={() => setIframeError(true)}
            />
        );
    }

    return (
        <div className="relative h-full w-full overflow-hidden bg-neutral-800 contain-paint">
            <iframe
                src={googleEmbedUrl}
                tabIndex={-1}
                aria-hidden
                title=""
                className="pointer-events-none absolute top-0 left-0 h-full w-full max-w-none border-0"
                style={{ border: 'none' }}
                onError={() => setIframeError(true)}
            />

            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${name}'s resume in a new tab`}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-neutral-950/55 text-white opacity-0 shadow-sm backdrop-blur-md transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>
        </div>
    );
}
