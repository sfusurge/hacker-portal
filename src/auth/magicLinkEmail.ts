export function magicLinkEmailHtml(params: { url: string; host: string }) {
    const { url, host } = params;

    const escapedHost = host.replace(/\./g, '&#8203;.');

    const brandColor = '#3b518a';
    const color = {
        background: '#f9f9f9',
        text: '#fff',
        mainBackground: '#fff',
        buttonBackground: brandColor,
        buttonBorder: brandColor,
        buttonText: '#fff',
    };

    return `
    <head>
    <style type="text/css">
      @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600");
    </style>

    <title></title>

    <style type="text/css">
      :root {
        --Text-text-primary: #000;
        --Size-3xl: 29px;
      }

      .title-heading {
        color: black;
        font-style: normal;
        font-weight: 600;
        line-height: 112.5%;
        letter-spacing: -0.435px;
        margin: 0;
        padding: 0;
      }
    </style>

    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin: 0; padding: 0">
    <center lang="en" dir="ltr" style="width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%">
      <table class="bg-fffffe" cellpadding="0" cellspacing="0" border="0" role="presentation" bgcolor="white" width="410" style="background-color: white; width: 410; border-spacing: 0; font-family: Inter, Tahoma, sans-serif; min-width: 410px; margin-top: 15px; margin-bottom: 15px;">
        <tr>
          <td valign="top" width="100.00%" style="width: 100%; vertical-align: top">
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100.00%" style="width: 100%; border-spacing: 0">
              <tr>
                <td align="left" style="padding-bottom: 26.89px; padding-left: 5px; padding-right: 15px">
                  <img src="https://x7pvefn5lz1gfty3.public.blob.vercel-storage.com/email_images/logo.png" alt="a black background with a few white lines on it" width="152" style="max-width: initial; width: 152px; display: block" />
                </td>
              </tr>
              <tr>
                <td align="left" style="padding-top: 16px; padding-bottom: 6.56px; padding-left: 15px; padding-right: 15px">
                  <h1 class="title-heading">Sign in to SFU Surge Portal</h1>
                </td>
              </tr>
              <tr>
                <td align="left" style="padding-top: 6.56px; padding-bottom: 4px; padding-left: 15px; padding-right: 15px">
                  <p class="color-000001" width="100.00%" style="font-size: 16px; font-weight: 400; letter-spacing: -0.12px; text-align: left; line-height: 24px; color: black; mso-line-height-rule: exactly; margin: 0; padding: 0; width: 100%">Welcome to the SFU Surge Portal! Join our passionate community of builders, hackers and innovators at SFU.</p>
                </td>
              </tr>
              <tr>
                <td align="left" style="padding-top: 4px; padding-bottom: 24px; padding-left: 15px; padding-right: 15px">
                  <p class="color-000001" width="100.00%" style="font-size: 16px; font-weight: 400; letter-spacing: -0.12px; text-align: left; line-height: 24px; color: black; mso-line-height-rule: exactly; margin: 0; padding: 0; width: 100%">Click the button below to sign in and get access to workshops, projects, hackathons and more.</p>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-top: 16px; padding-bottom: 16px">
                  <table class="bg-4338ca" cellpadding="0" cellspacing="0" border="0" role="presentation" bgcolor="#4338ca" width="220.00" height="44.00" style="border-radius: 8px; box-shadow: inset 0px 0px 0px 1px rgba(255, 255, 255, 0.12), inset 0px 1px 0px rgba(255, 255, 255, 0.24); background-color: #4338ca; width: 220px; height: 44px; border-spacing: 0; border-collapse: separate">
                    <tr>
                      <td valign="middle" width="100.00%" height="44.00" style="padding-left: 4px; padding-right: 4px; width: 100%; vertical-align: middle; height: 44px">
                        <a href="${url}" target="_blank" rel="noopener noreferrer" style="display: block; text-decoration: none; width: 100%;">
                          <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100.00%" style="width: 100%; border-spacing: 0">
                            <tr>
                              <td width="184.12" style="width: 184.12px">
                                <p class="color-fffffe" width="100.00%" style="font-size: 16px; font-weight: 400; letter-spacing: -0.12px; line-height: 16px; color: white; margin: 0; padding: 0; width: 100%; text-align: center; mso-line-height-alt: 16px">Sign in to Surge Portal</p>
                              </td>
                              <td>
                                <img src="https://x7pvefn5lz1gfty3.public.blob.vercel-storage.com/email_images/button_arrow.png" alt="a white arrow pointing to the right on a black background." width="24.00" height="16.00" style="width: 24px; height: 16px; display: block" />
                              </td>
                            </tr>
                          </table>
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding-top: 16px">
                  <p class="color-000000" width="100.00%" style="font-size: 14px; font-weight: 400; letter-spacing: -0.1px; color: rgba(0, 0, 0, 0.6); margin: 0; padding: 0; width: 100%; line-height: 21px; text-align: center; mso-line-height-rule: exactly">If you did not request this email you can safely ignore it.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </center>
  </body>
  `;
}
