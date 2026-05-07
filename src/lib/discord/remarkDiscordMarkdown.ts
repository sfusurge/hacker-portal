const UNDERLINE_RE = /__([^]*?)__/g;
const STRIKE_RE = /~~([\s\S]+?)~~/g;
// Discord allows ** text **, **text **, and ** text** as bold; CommonMark does not.
const LOOSE_BOLD_RE = /\*\* ?([^\n*]+?) ?\*\*/g;

/**
 * Preprocess Discord content string BEFORE passing to useRemarkSync.
 * - Normalises line endings
 * - Wraps ATX heading lines with blank lines so remark treats them as headings
 * - Ensures -# subtext lines get their own paragraph
 * - Converts Discord-lenient `** text **` to strict `**text**`
 * - Converts __text__ → [text](discord-u:) (MentionAnchor renders as <u>)
 */
export function preprocessDiscordMarkdown(content: string): string {
    let result = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    result = result.replace(/^(#{1,3} .+)$/gm, '\n$1\n');
    result = result.replace(/^(-# .+)$/gm, '\n$1');
    result = result.replace(
        LOOSE_BOLD_RE,
        (_, inner: string) => `**${inner.trim()}**`
    );
    result = result.replace(UNDERLINE_RE, (_, inner: string) => {
        const safe = inner.replace(/]/g, '\\]');
        return `[${safe}](discord-u:)`;
    });
    return result;
}

function makeDelete(inner: string): any {
    return { type: 'delete', children: [{ type: 'text', value: inner }] };
}

function splitOnStrikethrough(value: string): any[] {
    const nodes: any[] = [];
    let last = 0;
    STRIKE_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = STRIKE_RE.exec(value)) !== null) {
        if (m.index > last)
            nodes.push({ type: 'text', value: value.slice(last, m.index) });
        nodes.push(makeDelete(m[1]!));
        last = STRIKE_RE.lastIndex;
    }
    if (last < value.length)
        nodes.push({ type: 'text', value: value.slice(last) });
    return nodes.length > 0 ? nodes : [{ type: 'text', value }];
}

function walkInlineChildren(children: any[]): any[] {
    return children.flatMap((child) => {
        if (child.type === 'text') return splitOnStrikethrough(child.value);
        if (Array.isArray(child.children)) {
            return [{ ...child, children: walkInlineChildren(child.children) }];
        }
        return [child];
    });
}

function walkBlock(node: any): any {
    if (node.type === 'paragraph') {
        const first = node.children?.[0];
        if (first?.type === 'text' && String(first.value).startsWith('-# ')) {
            return {
                type: 'discordSubtext',
                data: {
                    hName: 'small',
                    hProperties: { className: ['discord-subtext'] },
                },
                children: walkInlineChildren([
                    { ...first, value: String(first.value).slice(3) },
                    ...node.children.slice(1),
                ]),
            };
        }
        return { ...node, children: walkInlineChildren(node.children ?? []) };
    }
    if (Array.isArray(node.children)) {
        return { ...node, children: node.children.map(walkBlock) };
    }
    return node;
}

export function remarkDiscordMarkdown() {
    return (tree: any) => {
        tree.children = (tree.children ?? []).map(walkBlock);
    };
}
