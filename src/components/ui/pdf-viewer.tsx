'use client';
import { useState } from 'react';
import { Card } from './card';
import { DocumentIcon } from '@heroicons/react/20/solid';
import { Button } from './button';
import Link from 'next/link';
import useMediaQuery from 'beautiful-react-hooks/useMediaQuery';

interface PdfViewerProps {
    url: string;
}

export default function PdfViewer({ url }: PdfViewerProps) {
    const isMobile = useMediaQuery('(max-width: 767px)');
    const [iframeError, setIframeError] = useState(false);
    const [embedError, setEmbedError] = useState(false);

    // Fallback if nothing works
    if ((isMobile && iframeError) || (!isMobile && iframeError && embedError)) {
        return (
            <Card className="flex min-h-[400px] w-full flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-neutral-600/60 bg-neutral-800 p-8 text-center">
                <DocumentIcon className="h-8 w-8 text-white" />
                <p className="text-lg font-medium text-white">
                    Unable to display PDF directly
                </p>
                <p className="w-1/2 text-sm text-white/60">
                    This PDF cannot be embedded. Please use the option below to
                    view or download the file.
                </p>
                <div className="mt-2 flex gap-4">
                    <Link href={url} target="_blank" rel="noopener noreferrer">
                        <Button
                            variant="default"
                            hierarchy="primary"
                            size="cozy"
                        >
                            Open PDF in New Tab
                        </Button>
                    </Link>
                </div>
            </Card>
        );
    }

    // Mobile: Google Drive embed
    if (isMobile) {
        const googleEmbedUrl = `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(
            url
        )}`;

        return (
            <div className="flex w-full flex-col items-center">
                <iframe
                    src={googleEmbedUrl}
                    width="100%"
                    height="600"
                    style={{ border: 'none' }}
                    onError={() => setIframeError(true)}
                />
            </div>
        );
    }

    // Desktop: normal iframe/embed fallback
    return (
        <div className="flex w-full flex-col items-center">
            {!iframeError ? (
                <iframe
                    src={url}
                    width="100%"
                    height="600"
                    onError={() => setIframeError(true)}
                />
            ) : !embedError ? (
                <embed
                    src={url}
                    type="application/pdf"
                    width="100%"
                    height="600"
                    onError={() => setEmbedError(true)}
                />
            ) : null}
        </div>
    );
}
