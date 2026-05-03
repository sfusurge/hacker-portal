'use client';

import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { unreadCountAtom } from '@/app/(auth)/ClientContext';

const FAVICON_SRC = '/favicon.png';

function getFaviconLink(): HTMLLinkElement {
    const existing = document.querySelector(
        "link[rel='icon']"
    ) as HTMLLinkElement | null;
    if (existing) return existing;
    const el = document.createElement('link');
    el.rel = 'icon';
    document.head.appendChild(el);
    return el;
}

function setFavicon(unreadCount: number) {
    const link = getFaviconLink();

    if (unreadCount <= 0) {
        link.href = FAVICON_SRC;
        return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = FAVICON_SRC + '?v=' + Date.now(); // bust cache so crossOrigin header is respected
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, 32, 32);

        // red badge dot in top-right
        const bx = 23,
            by = 9,
            r = 8;
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, 2 * Math.PI);
        ctx.fillStyle = '#ef4444';
        ctx.fill();

        const label = unreadCount > 99 ? '!' : String(unreadCount);
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${label.length > 1 ? 7 : 9}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, bx, by + 0.5);

        link.href = canvas.toDataURL('image/png');
    };
    img.onerror = () => {
        // fetch failed, show a plain red dot favicon
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(16, 16, 14, 0, 2 * Math.PI);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        link.href = canvas.toDataURL('image/png');
    };
}

export function DynamicTitle() {
    const unreadCount = useAtomValue(unreadCountAtom);
    const pathname = usePathname();

    useEffect(() => {
        const t = setTimeout(() => {
            const base = document.title.replace(/^\(\d+\)\s*/, '');
            document.title =
                unreadCount > 0 ? `(${unreadCount}) ${base}` : base;
        }, 0);

        return () => clearTimeout(t);
    }, [unreadCount, pathname]);

    useEffect(() => {
        setFavicon(unreadCount);
    }, [unreadCount]);

    return null;
}
