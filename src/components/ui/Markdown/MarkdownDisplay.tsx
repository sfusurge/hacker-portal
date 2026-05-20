'use client';

import { useRemarkSync } from 'react-remark';
import style from './MarkdownDisplay.module.css';

export function MarkdownDisplay({ content }: { content: string }) {
    const markdown = content.trim();
    const rendered = useRemarkSync(markdown || '');

    if (!markdown) {
        return null;
    }

    return <div className={style.md}>{rendered}</div>;
}
