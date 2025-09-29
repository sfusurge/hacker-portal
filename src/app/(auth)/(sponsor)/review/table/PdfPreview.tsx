'use client';

import { useState } from 'react';

interface PdfPreviewProps {
    url: string;
    name: string;
    height?: number;
}

export default function PdfPreview({
    url,
    name,
    height = 200,
}: PdfPreviewProps) {
    const [iframeError, setIframeError] = useState(false);
    const [embedError, setEmbedError] = useState(false);

    // Fallback
    if (iframeError && embedError) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
                <div className="text-xs text-white/60">📄</div>
                <p className="text-xs text-white/60">Preview unavailable</p>
                <p className="text-xs text-white/40">
                    Click to view full resume
                </p>
            </div>
        );
    }

    // iframe first
    if (!iframeError) {
        return (
            <iframe
                src={url}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title={`${name} Resume Preview`}
                onError={() => setIframeError(true)}
            />
        );
    }

    // fallback to embed
    if (!embedError) {
        return (
            <embed
                src={url}
                type="application/pdf"
                width="100%"
                height="100%"
                onError={() => setEmbedError(true)}
            />
        );
    }

    return null;
}
