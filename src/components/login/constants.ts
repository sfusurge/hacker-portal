export const OAUTH_PROVIDERS = [
    'Google',
    'Discord',
    'Figma',
    'GitHub',
] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];
