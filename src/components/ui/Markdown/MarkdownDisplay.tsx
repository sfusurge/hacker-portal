'use client';

import { useMemo } from 'react';
import { markdownToDisplayHtml } from '@/lib/markdown/markdownToDisplayHtml';
import { cn } from '@/lib/utils';
import style from './MarkdownDisplay.module.css';

export function MarkdownDisplay({ content }: { content: string }) {
    const markdown = (content ?? '').trim();
    const html = useMemo(() => markdownToDisplayHtml(markdown), [markdown]);

    if (!markdown) {
        return null;
    }

    return (
        <div
            className={cn(style.md, 'w-full max-w-full min-w-0')}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
