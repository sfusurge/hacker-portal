import Handlebars from 'handlebars';

/**
 * Prepare HTML content for email preview
 * @param content raw HTML content
 * @param options Additional options for preview rendering
 * @returns Formatted HTML string ready for iframe display
 */
export function prepareEmailPreview(
    content: string,
    options?: {
        showPlaceholders?: boolean;
        placeholders?: string[];
        darkMode?: boolean;
    }
): string {
    if (!content)
        return '<div style="padding: 20px;">No content to preview</div>';

    // Process the content to highlight placeholders
    let processedContent = content;

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
 * Prepares email content for sending by replacing placeholders with actual values
 * @param content The email template content potentially with placeholders
 * @param data Object containing values to replace Handlebars placeholders
 * @param options Configuration options
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
