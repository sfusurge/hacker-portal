/**
 * Role helpers with no database imports, so both server and client code can use
 * them. Role hierarchy: `owner` sits above `admin` and inherits all admin
 * permissions; `owner` is additionally the only role allowed to configure
 * hackathons.
 */

export const ADMIN_ROLES_EXCLUDED_FROM_STATS: string[] = ['admin', 'owner'];

export function hasAdminAccess(role: string | null | undefined): boolean {
    return role === 'admin' || role === 'owner';
}

export function isOwner(role: string | null | undefined): boolean {
    return role === 'owner';
}
