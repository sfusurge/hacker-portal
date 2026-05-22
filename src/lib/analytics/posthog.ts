import posthog from 'posthog-js';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();

// false when the key is unset — no init, capture, or network requests.
export function isPostHogConfigured(): boolean {
    return Boolean(POSTHOG_KEY);
}

export const POSTHOG_API_HOST = '/ingest';
const POSTHOG_UI_HOST = 'https://us.posthog.com';

export const POSTHOG_APP = 'hacker-portal' as const;

// mark static UI that may show PII in session replay (e.g. profile email)
export const POSTHOG_MASK_ATTR = 'data-ph-mask';

const POSTHOG_MASK_TEXT_SELECTOR = [
    `[${POSTHOG_MASK_ATTR}]`,
    '[data-sensitive]',
    '[type="password"]',
    '[type="email"]',
    '[autocomplete="email"]',
    '[name*="email" i]',
    '[name*="password" i]',
].join(', ');

function maskReplayText(text: string, element?: HTMLElement): string {
    if (!text.trim()) return text;
    if (element?.closest(`[${POSTHOG_MASK_ATTR}], [data-sensitive]`)) {
        return '*'.repeat(text.length);
    }
    return text.replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '***@***.***');
}

function registerPostHogSuperProperties(): void {
    posthog.register({
        app: POSTHOG_APP,
    });
}

// true when configured and running in the browser (safe to call posthog APIs).
export function isPostHogEnabled(): boolean {
    return typeof window !== 'undefined' && isPostHogConfigured();
}

let initialized = false;

export function initPostHog(): void {
    if (typeof window === 'undefined' || !POSTHOG_KEY || initialized) {
        return;
    }

    posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_API_HOST,
        ui_host: POSTHOG_UI_HOST,
        person_profiles: 'identified_only',
        capture_pageview: false,
        capture_pageleave: true,
        rageclick: true,
        session_recording: {
            maskAllInputs: true,
            maskInputOptions: {
                password: true,
                email: true,
                tel: true,
                text: true,
                textarea: true,
                select: true,
                search: true,
                url: true,
            },
            maskTextSelector: POSTHOG_MASK_TEXT_SELECTOR,
            maskTextFn: maskReplayText,
        },
        loaded: (client) => {
            registerPostHogSuperProperties();
            if (process.env.NODE_ENV === 'development') {
                client.debug();
            }
        },
    });

    initialized = true;
}

export function capturePostHogPageview(url: string): void {
    if (!isPostHogEnabled()) return;
    posthog.capture('$pageview', { $current_url: url });
}

export function identifyPostHogUser(
    userId: number,
    properties: Record<string, string | number | boolean | null | undefined>
): void {
    if (!isPostHogEnabled()) return;
    posthog.identify(String(userId), properties);
}

export function resetPostHogUser(): void {
    if (!isPostHogEnabled()) return;
    posthog.reset();
    registerPostHogSuperProperties();
}

export { posthog };
