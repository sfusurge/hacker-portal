'use client';

interface PdfViewerProps {
    url: string;
}

export default function PdfViewer({ url }: PdfViewerProps) {
    const urlWithZoom = url.includes('?') ? `${url}#zoom=75` : `${url}#zoom=75`;

    return (
        <div className="flex w-full flex-col items-center">
            <embed
                src={urlWithZoom}
                type="application/pdf"
                width="100%"
                height="100%"
                className="h-[600px] rounded-md"
            />
        </div>
    );
}
