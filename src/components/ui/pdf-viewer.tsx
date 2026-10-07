'use client';
import { useState } from 'react';
import { Card } from './card';
import { DocumentIcon } from '@heroicons/react/20/solid';
import { Button } from './button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PdfViewerProps {
    url: string;
    fill?: boolean;
    className?: string;
}

export default function PdfViewer({
    url,
    fill = false,
    className,
}: PdfViewerProps) {
    const [iframeError, setIframeError] = useState(false);

    const googleEmbedUrl = `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(
        url
    )}&zoom=67`;

    // Fallback if nothing works
    if (iframeError) {
        return (
            <Card
                className={cn(
                    'flex w-full flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-neutral-600/60 bg-neutral-800 p-8 text-center',
                    fill ? 'h-full min-h-0' : 'min-h-[400px]',
                    className
                )}
            >
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

    return (
        <div
            className={cn(
                'flex w-full flex-col items-center',
                fill && 'h-full min-h-0',
                className
            )}
        >
            <iframe
                src={googleEmbedUrl}
                title="PDF viewer"
                className={cn('w-full border-0', fill && 'h-full min-h-0')}
                width="100%"
                height={fill ? undefined : 600}
                style={
                    fill
                        ? { height: '100%', border: 'none' }
                        : { border: 'none' }
                }
                onError={() => setIframeError(true)}
            />
        </div>
    );
}
