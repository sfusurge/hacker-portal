// true when `placeHolder` is long-form markdown (e.g. a table), not a short textarea hint.
export function isMarkdownFormattingGuide(text: string): boolean {
    const trimmed = text.trim();
    if (!trimmed) return false;
    return (
        /^\s*#{1,6}\s/m.test(trimmed) || /\|.+\|[\s\S]*\|[-:]+\|/.test(trimmed)
    );
}
