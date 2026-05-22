// shown beside markdown fields as a rendered reference (tables need GFM + MarkdownDisplay).
export const MARKDOWN_FORMATTING_GUIDE = `## 🛠️ Design Tools

| Tool       | Purpose                          |
|------------|----------------------------------|
| Figma      | UI/UX design & prototyping       |
| Procreate  | Illustration & visual assets     |

**You can also use:**
- **bold** and *italic*
- Bullet lists
- [links](https://example.com)
`;

// true when \`placeHolder\` is long-form markdown (e.g. a table), not a short textarea hint.
export function isMarkdownFormattingGuide(text: string): boolean {
    const trimmed = text.trim();
    if (!trimmed) return false;
    return (
        /^\s*#{1,6}\s/m.test(trimmed) || /\|.+\|[\s\S]*\|[-:]+\|/.test(trimmed)
    );
}
