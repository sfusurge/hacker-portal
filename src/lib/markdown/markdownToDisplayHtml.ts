import { marked } from 'marked';

let markedConfigured = false;

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (char) => {
        switch (char) {
            case '&':
                return '&amp;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '"':
                return '&quot;';
            default:
                return '&#39;';
        }
    });
}

function safeHref(href: string | null | undefined): string | null {
    if (!href) return null;
    const trimmed = href.trim();
    const compact = trimmed.replace(/[\u0000-\u0020\u007f]/g, '');
    const scheme = compact.match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase();
    if (scheme && !['http', 'https', 'mailto'].includes(scheme)) {
        return null;
    }
    return trimmed;
}

function configureMarkedForDisplay() {
    if (markedConfigured) return;
    markedConfigured = true;

    marked.use({
        gfm: true,
        breaks: false,
        renderer: {
            link({ href, title, text }) {
                const safe = safeHref(href);
                if (!safe) return text;
                const titleAttr = title
                    ? ` title="${escapeHtml(String(title))}"`
                    : '';
                return `<a href="${escapeHtml(safe)}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`;
            },
            image({ href, title, text }) {
                const safe = safeHref(href);
                if (!safe) return escapeHtml(text);
                const titleAttr = title
                    ? ` title="${escapeHtml(String(title))}"`
                    : '';
                return `<img src="${escapeHtml(safe)}" alt="${escapeHtml(text)}"${titleAttr}>`;
            },
            html({ text }) {
                return escapeHtml(text);
            },
        },
    });
}

export function markdownToDisplayHtml(content: string): string {
    configureMarkedForDisplay();
    const trimmed = (content ?? '').trim();
    if (!trimmed) return '';

    try {
        return marked.parse(trimmed, { async: false }) as string;
    } catch {
        return '';
    }
}
