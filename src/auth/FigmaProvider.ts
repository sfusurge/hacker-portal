import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { Provider } from 'next-auth/providers';

/**
 * FIXME: This is a temporary, untested solution provided here: https://github.com/nextauthjs/next-auth/issues/5841
 * When Authjs releases an "official" solution for figma OAuth 2.0, update to that.
 */

export const FigmaProvider: (params: {
    clientId: string;
    clientSecret: string;
}) => Provider = ({ clientId, clientSecret }) => ({
    id: 'figma',
    name: 'Figma',
    type: 'oauth',
    authorization: {
        url: 'https://www.figma.com/oauth',
        params: {
            scope: 'file_read',
            response_type: 'code',
        },
    },
    token: {
        url: 'https://api.figma.com/v1/oauth/token',
        async request(context: any) {
            const provider = context.provider;

            // Create Base64-encoded credentials for Basic Auth
            const credentials = Buffer.from(
                `${provider.clientId}:${provider.clientSecret}`
            ).toString('base64');

            // Prepare form data
            const formData = new URLSearchParams({
                redirect_uri: provider.callbackUrl,
                code: context.params.code,
                grant_type: 'authorization_code',
                code_verifier: context.params.code_verifier || '',
            });

            const res = await fetch('https://api.figma.com/v1/oauth/token', {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(`Failed to get token: ${JSON.stringify(json)}`);
            }

            return {
                tokens: {
                    access_token: json.access_token,
                    refresh_token: json.refresh_token,
                    expires_in: json.expires_in,
                    token_type: json.token_type || 'Bearer',
                },
            };
        },
    },
    userinfo: 'https://api.figma.com/v1/me',
    profile(profile) {
        return {
            id: profile.id,
            name: profile.handle || profile.name,
            email: profile.email || null,
            image: profile.img_url || profile.avatar_url,
        };
    },
    clientId,
    clientSecret,
    checks: ['state'], // Ensure state is checked for CSRF protection
    allowDangerousEmailAccountLinking: true,
});
