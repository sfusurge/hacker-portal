import { EMAIL_STYLING_BODY_PLACEHOLDER } from '@/db/schema/emails';

/**
 * Minimal email styling template: no external scripts or resources (avoids 404s in preview).
 * Use this as the default when creating a new styling.
 */
export const BASIC_EMAIL_STYLING_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Email</title>
  <style type="text/css">
    body, #wrapper { margin: 0; padding: 0; background-color: #f5f5f5; }
    table { border-collapse: collapse; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .body-cell { padding: 24px; font-family: Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #333333; }
    h1, h2, h3 { margin: 0 0 12px 0; color: #202020; }
    a { color: #0066cc; text-decoration: underline; }
    img { max-width: 100%; height: auto; border: 0; }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" id="wrapper">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0">
          <tr>
            <td class="body-cell">
${EMAIL_STYLING_BODY_PLACEHOLDER}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
