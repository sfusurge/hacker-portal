import NextAuth from 'next-auth';
import { user } from '@/db/schema/users/users';
import { authConfig } from './authConfig';
import NodeMailerProvider from 'next-auth/providers/nodemailer';

import { eq } from 'drizzle-orm';
import { databaseClient } from '@/db/client';
import { transporter } from '@/server/nodemailerTransporter';
import { addUser } from '@/server/routers/usersRouter';

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        ...authConfig.providers,
        NodeMailerProvider({
            server: process.env.AUTH_MAIL_SERVER ?? '',
            from: process.env.SENDINGEMAIL,
            sendVerificationRequest: async ({ url, expires, identifier }) => {
                await new Promise((resolve, reject) => {
                    transporter.verify((err, suc) => {
                        if (err) {
                            console.log('verify transporter failed', err);
                            reject(err);
                        } else if (suc) {
                            console.log('verify transporter success', err);
                            resolve(suc);
                        } else {
                            console.log(
                                'verify transporter bad result',
                                err,
                                suc
                            );
                        }
                    });
                });

                await new Promise((resolve, reject) => {
                    const host = new URL(url).host;
                    transporter.sendMail(
                        {
                            to: identifier,
                            from: process.env.SENDINGEMAIL,
                            subject: 'Sign in!',
                            text: `sign in to ${host}`,
                            html: html({ url, host }),
                        },
                        (error, info) => {
                            if (error) {
                                console.log('auth email error: ', error);
                                reject(error);
                            } else if (info) {
                                console.log('auth email success: ', info);
                                resolve(info);
                            } else {
                                console.log('bad send result', error, info);
                                reject('bad send result');
                            }
                        }
                    );
                });
            },
        }),
    ],
    callbacks: {
        signIn: async ({ user: signinUser, profile, credentials, account }) => {
            if (!signinUser.email) {
                console.log(`bad login! signing out:  ${signinUser}`);

                // bad login, somehow
                return await signOut({
                    redirectTo: '/login',
                });
            }

            let dbUser = (
                await databaseClient
                    .select()
                    .from(user)
                    .where(eq(user.email, signinUser.email))
                    .limit(1)
            )[0];

            // logged in, but user doesn't exist in db, so lets make one.
            if (!dbUser) {
                const res = await addUser({
                    email: signinUser.email,
                });

                if (res) {
                    dbUser = {
                        ...res,
                        firstName: null,
                        lastName: null,
                        phoneNumber: null,
                    };
                }
            }

            return true;
        },
        session: ({ session, token, user }) => {
            session.userId = token.sub ?? '-1';
            session.user.image = token.picture;
            return session as SessionType;
        },
    },
});

export interface SessionType {
    user: {
        name: string | null;
        email: string;
        image: string | null;
    };
    expires: string;
    userId: string;
}

function html(params: { url: string; host: string }) {
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
    <!--[if (!mso)&(!ie)]>These<!-- -->
    <!--<![endif]-->
    <!--[if (!mso)&(!ie)]>are<!-- -->
    <!--<![endif]-->
    <!--[if (!mso)&(!ie)]>for<!-- -->
    <!--<![endif]-->
    <!--[if (!mso)&(!ie)]>outlook<!-- -->
    <!--<![endif]-->
    <!--[if (!mso)&(!ie)]>live<!-- -->
    <!--<![endif]-->
    <!--[if (!mso)&(!ie)]>that<!-- -->
    <!--<![endif]-->
    <!--[if (!mso)&(!ie)]>removes<!-- -->
    <!--<![endif]-->
    <!--[if (!mso)&(!ie)]>the first<!-- -->
    <!--<![endif]-->
    <!--[if (!mso)&(!ie)]>10 well-formed<!-- -->
    <!--<![endif]-->
    <!--[if (!mso)&(!ie)]>conditional comments<!-- -->
    <!--<![endif]-->
    <!--[if gte mso 9]>
      <xml>
        <o:OfficeDocumentSettings xmlns:o="urn:schemas-microsoft-com:office:office">
          <o:AllowPNG />
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->

    <style type="text/css">
      .dark-mode .bg-fffffe {
        background-color: #fffffe !important;
      }
      .dark-mode .color-000001 {
        color: #000001 !important;
      }
      .dark-mode .bg-4338ca {
        background-color: #4338ca !important;
      }
      .dark-mode .color-fffffe {
        color: #fffffe !important;
      }
      .dark-mode .color-000000 {
        color: rgba(0, 0, 0, 0.6) !important;
      }

      @media (prefers-color-scheme: dark) {
        html:not(.light-mode) .bg-fffffe {
          background-color: #fffffe !important;
        }
        html:not(.light-mode) .color-000001 {
          color: #000001 !important;
        }
        html:not(.light-mode) .bg-4338ca {
          background-color: #4338ca !important;
        }
        html:not(.light-mode) .color-fffffe {
          color: #fffffe !important;
        }
        html:not(.light-mode) .color-000000 {
          color: rgba(0, 0, 0, 0.6) !important;
        }
      }

      [data-ogsc] .bg-fffffe {
        background-color: #fffffe !important;
      }
      [data-ogsc] .color-000001 {
        color: #000001 !important;
      }
      [data-ogsc] .bg-4338ca {
        background-color: #4338ca !important;
      }
      [data-ogsc] .color-fffffe {
        color: #fffffe !important;
      }
      [data-ogsc] .color-000000 {
        color: rgba(0, 0, 0, 0.6) !important;
      }
    </style>

    <meta name="color-scheme" content="light dark" />

    <meta name="supported-color-schemes" content="light dark" />

    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <!--<![endif]-->

    <meta name="x-apple-disable-message-reformatting" />

    <style></style>

    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <style type="text/css">
      u + div .kombai-email-compat__list-with-padding-left {
        padding-left: 0.5em !important;
      }
    </style>

    <!--[if mso]>
      <style type="text/css">
        v\:* {
          behavior: url(#default#VML);
          display: inline-block;
        }
        o\:* {
          behavior: url(#default#VML);
          display: inline-block;
        }
        w\:* {
          behavior: url(#default#VML);
          display: inline-block;
        }
        .ExternalClass {
          width: 100%;
        }
        table {
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        img {
          -ms-interpolation-mode: bicubic;
        }
        .ReadMsgBody {
          width: 100%;
        }
        a {
          background: transparent !important;
          background-color: transparent !important;
        }

        li {
          text-align: -webkit-match-parent;
          display: list-item;
          text-indent: -1em;
        }

        ul,
        ol {
          margin-left: 1em !important;
        }

        p {
          text-indent: 0;
        }
      </style>
    <![endif]-->
  </head>
  <body style="margin: 0; padding: 0">
    <div style="font-size: 0px; line-height: 1px; mso-line-height-rule: exactly; display: none; max-width: 0px; max-height: 0px; opacity: 0; overflow: hidden; mso-hide: all"></div>
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
                    <img src="https://x7pvefn5lz1gfty3.public.blob.vercel-storage.com/email_images/button_text.png" alt="Sign in to SFU Surge Portal" width="369" style="max-width: initial; width: 369px; display: block; margin-top: -0.5px">
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
    /*
  <body style="background: ${color.background};">
    <table width="100%" border="0" cellspacing="20" cellpadding="0"
      style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
      <tbody>
        <tr>
            <td valign="top" class="mcnTextContent" style="padding-top: 0;padding-right: 18px;padding-bottom: 9px;padding-left: 18px;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;word-break: break-word;color: #202020;font-family: Helvetica;font-size: 16px;line-height: 150%;text-align: left;">

                <h1 style="text-align: center;display: block;margin: 0;padding: 0;color: #202020;font-family: Helvetica;font-size: 26px;font-style: normal;font-weight: bold;line-height: 125%;letter-spacing: normal;">
                    <img height="82" src="https://mcusercontent.com/33345c9bc17f10bac6afdd0ac/images/14ae4e9e-b849-ff79-250b-236ca05de560.png" style="border: 0px;max-width: 100%;height: auto;margin: 0px;outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;" width="660">
                </h1>

                <p style="margin: 10px 0; color:#000; font-family: Helvetica; font-size:14px; line-height:150%;">
                    We are thrilled to see your interest in joining Stormhacks!
                </p>

                <p style="margin: 10px 0; color:#000; font-family: Helvetica; font-size:14px; line-height:150%;">
                    Your account is ready, and you’re officially part of the journey. This is your first step toward
                    connecting with other hackers, building meaningful projects, and tackling challenges that push you
                    outside your comfort zone.
                </p>

                <p style="margin: 10px 0; color:#000; font-family: Helvetica; font-size:14px; line-height:150%;">
                    Mark your calendar — StormHacks kicks off on <b>October 4th</b>! Between workshops, activities,
                    and plenty of hacking time, you’ll have everything you need to learn, grow, and make something awesome.
                </p>

                <p style="margin: 10px 0; color:#000; font-family: Helvetica; font-size:14px; line-height:150%;">
                    Click the button below to sign in and set up your profile:
                </p>

                <table border="0" cellspacing="0" cellpadding="0" align="center">
                    <tr>
                        <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                            target="_blank"
                            style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign in!</a>
                        </td>
                    </tr>
                </table>
                <p>
                <span style="font-size:14px">The StormHacks Team</span><br>
                    <br>
                    <span style="font-size:13px"><em>(fueled by matcha, delusion, and 2 hours of daily sleep)</em></span>
                </p>
                <hr>
            </td>
        </tr>
    </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center"
          style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
          If you did not request this email you can safely ignore it.
        </td>
      </tr>
    </table>
  </body>
  `;
  */
}
