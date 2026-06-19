import { marked } from 'marked';

let markedConfigured = false;

function configureMarkedForDisplay() {
    if (markedConfigured) return;
    markedConfigured = true;

    marked.use({
        gfm: true,
        breaks: false,
        renderer: {
            link({ href, title, text }) {
                if (!href) return text;
                const titleAttr = title
                    ? ` title="${String(title).replace(/"/g, '&quot;')}"`
                    : '';
                const safeHref = String(href).replace(/"/g, '&quot;');
                return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`;
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
