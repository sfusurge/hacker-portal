'use client';

import { useState } from 'react';
import useMediaQuery from 'beautiful-react-hooks/useMediaQuery';

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
    const isMobile = useMediaQuery('(max-width: 767px)');
    const [iframeError, setIframeError] = useState(false);
    const [embedError, setEmbedError] = useState(false);

    // Fallback if nothing works
    if ((isMobile && iframeError) || (!isMobile && iframeError && embedError)) {
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

    const googleEmbedUrl = `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(
        url
    )}&zoom=67`;

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
