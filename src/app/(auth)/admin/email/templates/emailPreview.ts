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

/** Removes literal \t (backslash-t) from styling HTML so pasted templates don't show stray characters. */
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

    const bodyHtml = processedContent;

    if (options?.stylingHtml) {
        let fullHtml = mergeBodyIntoStyling(options.stylingHtml, bodyHtml);
        // If styling didn't contain the placeholder, inject body before </body> so preview still shows content
        if (!options.stylingHtml.includes(EMAIL_STYLING_BODY_PLACEHOLDER)) {
            fullHtml = fullHtml.replace(
                /<\/body\s*>/i,
                () => bodyHtml + '</body>'
            );
        }
        // Strip <script> tags so preview doesn't load external scripts (avoids 404s)
        fullHtml = fullHtml.replace(/<script\b[\s\S]*?<\/script>/gi, '');
        if (typeof window !== 'undefined') {
            const baseTag = `<base href="${window.location.origin}/">`;
            fullHtml = fullHtml.replace(
                /<head(\s[^>]*)?>/i,
                (m) => m + baseTag
            );
        }
        // When placeholders are highlighted, inject handlebar styling so detected {{placeholders}} are visible
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
        .placeholder-highlight {
          background-color: #f0f7ff;
          border: 1px solid #cce5ff;
          border-radius: 3px;
          padding: 0 4px;
          color: #0066cc;
          font-weight: bold;
        }
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
 * Expects content to already be HTML (call markdownToHtml first when template uses a styling).
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
            // Compile the template
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

    processedContent = processedContent
        .replace(/\\t/g, '\t')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, '\\');

    return processedContent;
}
