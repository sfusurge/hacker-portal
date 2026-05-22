'use client';

import { createElement, type ReactNode } from 'react';
import { useRemarkSync } from 'react-remark';
import { cn } from '@/lib/utils';
import style from './MarkdownDisplay.module.css';

function SafeMarkdownLink({
    href,
    children,
    ...rest
}: {
    href?: string;
    children?: ReactNode;
    [key: string]: unknown;
}) {
    const hrefString = typeof href === 'string' ? href.trim() : undefined;

    if (!hrefString) {
        return <span {...rest}>{children}</span>;
    }

    return (
        <a
            href={hrefString}
            target="_blank"
            rel="noopener noreferrer"
            {...rest}
        >
            {children}
        </a>
    );
}

export function MarkdownDisplay({ content }: { content: string }) {
    const markdown = content.trim();
    const rendered = useRemarkSync(markdown || '\u00a0', {
        rehypeReactOptions: {
            components: {
                a: SafeMarkdownLink,
            },
            createElement,
        },
    });

    if (!markdown) {
        return null;
    }

    return (
        <div className={cn(style.md, 'w-full max-w-full min-w-0')}>
            {rendered}
        </div>
    );
}
