'use client';

interface PdfViewerProps {
    url: string;
}

export default function PdfViewer({ url }: PdfViewerProps) {
    const urlWithZoom = url.includes('?') ? `${url}#zoom=75` : `${url}#zoom=75`;

    return (
        <div className="flex w-full flex-col items-center">
            <iframe src={url} width="100%" height="600" className="border" />
        </div>
    );
}
