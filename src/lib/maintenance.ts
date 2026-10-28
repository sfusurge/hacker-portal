/**
 * Paths that stay reachable while MAINTENANCE=true.
 *
 * Enforcement lives in proxy.ts; keep this list in sync with anything the
 * bypassed pages need to load (e.g. the statistics API).
 */
const MAINTENANCE_BYPASS_PATHS = [
    '/maintenance',
    '/statistics',
    '/api/blob/statistics',
    '/api/cron',
    '/api/webhooks',
];

export function isMaintenanceMode(): boolean {
    return process.env.MAINTENANCE === 'true';
}

export function isMaintenanceBypassPath(pathname: string): boolean {
    return MAINTENANCE_BYPASS_PATHS.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
    );
}
