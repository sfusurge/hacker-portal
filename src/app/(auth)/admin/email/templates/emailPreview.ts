import Handlebars from 'handlebars';
import { marked } from 'marked';
import { EMAIL_STYLING_BODY_PLACEHOLDER } from '@/db/schema/emails';

const PLACEHOLDER_HIGHLIGHT_CSS =
    '.placeholder-highlight{background-color:#f0f7ff;border:1px solid #cce5ff;border-radius:3px;padding:0 4px;color:#0066cc;font-weight:bold;}';

function unescapeTemplateEscapes(html: string): string {
    return html
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
