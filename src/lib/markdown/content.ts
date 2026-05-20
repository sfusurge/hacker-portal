type QuillOp = { insert?: unknown };

export function isQuillDelta(value: unknown): value is { ops: QuillOp[] } {
    return (
        typeof value === 'object' &&
        value !== null &&
        'ops' in value &&
        Array.isArray((value as { ops: unknown }).ops)
    );
}

export function quillDeltaToPlainText(content: unknown): string {
    if (!isQuillDelta(content)) {
        return '';
    }
    return (
        content.ops
            ?.map((op) => (typeof op.insert === 'string' ? op.insert : ''))
            .join('')
            .trim() ?? ''
    );
}

export function formFieldContentToPlainText(content: unknown): string {
    if (typeof content === 'string') {
        return content.trim();
    }
    return quillDeltaToPlainText(content);
}
