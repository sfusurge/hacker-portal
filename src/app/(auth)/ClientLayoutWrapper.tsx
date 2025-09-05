'use client';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function ClientLayoutWrapper({
    children,
}: {
    children: ReactNode;
}) {
    const pathname = usePathname();
    const isQRSection = pathname?.includes('/admin/qr');
    return (
        <div
            className={`bg-neutral-950 p-0 md:flex md:p-5 ${isQRSection ? 'no-scrollable' : ''}`}
            style={{ height: '100dvh' }}
        >
            {children}
        </div>
    );
}
