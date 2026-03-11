import Handlebars from 'handlebars';
import { marked } from 'marked';
import { EMAIL_STYLING_BODY_PLACEHOLDER } from '@/db/schema/emails';

/**
 * Converts Markdown to HTML. Use only for body content when a styling is used.
 */
export function markdownToHtml(content: string): string {
    if (!content.trim()) return content;
    try {
        return marked.parse(content, { async: false }) as string;
    } catch {
        return content;
    }
}

function stripBackslashT(html: string): string {
    return html.replace(/\\t/g, '');
}

/**
 * Merges body content into a styling wrapper.
 * Replaces EMAIL_STYLING_BODY_PLACEHOLDER in stylingHtml with bodyContent.
 * Trims bodyContent and strips literal \t from styling HTML so pasted templates render cleanly.
 */
export function mergeBodyIntoStyling(
    stylingHtml: string,
    bodyContent: string
): string {
    stylingHtml = stripBackslashT(stylingHtml);
    if (!stylingHtml.includes(EMAIL_STYLING_BODY_PLACEHOLDER)) {
        return stylingHtml;
    }
    const trimmed = bodyContent.trim();
    return stylingHtml.replace(
        new RegExp(
            EMAIL_STYLING_BODY_PLACEHOLDER.replace(
                /[.*+?^${}()|[\]\\]/g,
                '\\$&'
            ),
            'g'
        ),
        trimmed
    );
}

/**
 * Prepare HTML content for email preview.
 * When stylingHtml is set, content is treated as Markdown (body) and converted to HTML.
 * When no stylingHtml, content is full HTML (legacy templates).
 * @param content Body as Markdown (when stylingHtml set) or full HTML
 * @param options.stylingHtml When set, content is body Markdown → HTML, then injected at {{bodyContent}}
 * @returns Formatted HTML string ready for iframe display
 */
export function prepareEmailPreview(
    content: string,
    options?: {
        showPlaceholders?: boolean;
        placeholders?: string[];
        darkMode?: boolean;
        /** When set, content is body Markdown and is converted to HTML, then injected into this styling HTML. */
        stylingHtml?: string;
    }
): string {
    if (!content)
        return '<div style="padding: 20px;">No content to preview</div>';

    // Body content (with styling) = Markdown → HTML. Full template (no styling) = HTML as-is.
    let processedContent = options?.stylingHtml
        ? markdownToHtml(content)
        : content;

    // Apply placeholder highlighting if needed
    if (options?.showPlaceholders && (options.placeholders?.length ?? 0) > 0) {
        options.placeholders!.forEach((placeholder) => {
            const escapedPlaceholder = placeholder.replace(
                /[.*+?^${}()|[\]\\]/g,
                '\\$&'
            );
            processedContent = processedContent.replace(
                new RegExp(escapedPlaceholder, 'g'),
                `<span class="placeholder-highlight">${placeholder}</span>`
            );
        });
    }

    // Handle escape sequences
    processedContent = processedContent
        .replace(/\\t/g, '\t')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, '\\');
}

export function markdownToHtml(content: string): string {
    if (!content.trim()) return content;
    try {
        return marked.parse(content, { async: false }) as string;
    } catch {
        return content;
    }
}

export function mergeBodyIntoStyling(
    stylingHtml: string,
    bodyContent: string
): string {
    stylingHtml = stylingHtml.replace(/\\t/g, '');
    if (!stylingHtml.includes(EMAIL_STYLING_BODY_PLACEHOLDER)) {
        return stylingHtml;
    }
    const trimmed = bodyContent.trim();
    return stylingHtml.replace(
        new RegExp(
            EMAIL_STYLING_BODY_PLACEHOLDER.replace(
                /[.*+?^${}()|[\]\\]/g,
                '\\$&'
            ),
            'g'
        ),
        trimmed
    );
}

export function prepareEmailPreview(
    content: string,
    options?: {
        showPlaceholders?: boolean;
        placeholders?: string[];
        darkMode?: boolean;
        stylingHtml?: string;
        markdownBodyOnly?: boolean;
    }
): string {
    if (!content)
        return '<div style="padding: 20px;">No content to preview</div>';

    const stylingTrimmed = options?.stylingHtml?.trim() ?? '';
    const hasStylingWrapper = stylingTrimmed.length > 0;
    const useMarkdown = hasStylingWrapper || Boolean(options?.markdownBodyOnly);

    let processedContent = useMarkdown ? markdownToHtml(content) : content;

    if (options?.showPlaceholders && (options.placeholders?.length ?? 0) > 0) {
        for (const placeholder of options.placeholders!) {
            const escaped = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            processedContent = processedContent.replace(
                new RegExp(escaped, 'g'),
                `<span class="placeholder-highlight">${placeholder}</span>`
            );
        }
    }

    processedContent = unescapeTemplateEscapes(processedContent);

    if (hasStylingWrapper) {
        let fullHtml = mergeBodyIntoStyling(stylingTrimmed, processedContent);
        if (!stylingTrimmed.includes(EMAIL_STYLING_BODY_PLACEHOLDER)) {
            fullHtml = fullHtml.replace(
                /<\/body\s*>/i,
                () => processedContent + '</body>'
            );
        }
        fullHtml = fullHtml.replace(/<script\b[\s\S]*?<\/script>/gi, '');

        let headInject = '';
        if (typeof window !== 'undefined') {
            headInject += `<base href="${window.location.origin}/">`;
        }
        if (
            options?.showPlaceholders &&
            (options.placeholders?.length ?? 0) > 0
        ) {
            headInject += `<style type="text/css">${PLACEHOLDER_HIGHLIGHT_CSS}</style>`;
        }
        if (headInject) {
            fullHtml = fullHtml.replace(
                /<head(\s[^>]*)?>/i,
                (m) => m + headInject
            );
        }
        return fullHtml;
    }

    const bodyHtml = processedContent;

    if (options?.stylingHtml) {
        let fullHtml = mergeBodyIntoStyling(options.stylingHtml, bodyHtml);
        if (!options.stylingHtml.includes(EMAIL_STYLING_BODY_PLACEHOLDER)) {
            fullHtml = fullHtml.replace(
                /<\/body\s*>/i,
                () => bodyHtml + '</body>'
            );
        }
        fullHtml = fullHtml.replace(/<script\b[\s\S]*?<\/script>/gi, '');
        if (typeof window !== 'undefined') {
            const baseTag = `<base href="${window.location.origin}/">`;
            fullHtml = fullHtml.replace(
                /<head(\s[^>]*)?>/i,
                (m) => m + baseTag
            );
        }
        if (
            options?.showPlaceholders &&
            (options.placeholders?.length ?? 0) > 0
        ) {
            const placeholderStyle = `<style type="text/css">.placeholder-highlight{background-color:#f0f7ff;border:1px solid #cce5ff;border-radius:3px;padding:0 4px;color:#0066cc;font-weight:bold;}</style>`;
            fullHtml = fullHtml.replace(
                /<head(\s[^>]*)?>/i,
                (m) => m + placeholderStyle
            );
        }
        return fullHtml;
    }

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <base href="${typeof window !== 'undefined' ? window.location.origin : ''}">
      <style>
        ${PLACEHOLDER_HIGHLIGHT_CSS}
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.5;
          color: ${options?.darkMode ? '#f5f5f5' : '#333'};
          background-color: ${options?.darkMode ? '#121212' : '#ffffff'};
          margin: 0;
          padding: 20px;
        }
        img {
          max-width: 100%;
        }
      </style>
    </head>
    <body>
      ${processedContent}
    </body>
    </html>
  `;
}
/**
 * Prepares email content for sending by replacing placeholders with actual values.
 * @param content HTML template with placeholders
 * @param data Object containing values to replace Handlebars placeholders
 * @returns Processed HTML content ready for sending
 */
export function prepareEmailContent(
    content: string,
    data: Record<string, any>,
    options?: { skipHandlebars?: boolean }
): string {
    if (!content) return '';

    let processedContent = content;

    if (!options?.skipHandlebars) {
        Handlebars.registerHelper('safe', function (text) {
            const stringText = String(text ?? '');
            return new Handlebars.SafeString(stringText);
        });

        try {
            const template = Handlebars.compile(processedContent, {
                preventIndent: true,
                strict: false,
            });
            processedContent = template(data);
        } catch (error) {
            console.error('Error processing Handlebars template:', error);
            return content;
        }
    }

    return unescapeTemplateEscapes(processedContent);
}
