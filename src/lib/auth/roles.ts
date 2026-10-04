/** Role helpers shared by server and client. Owner includes admin access. */

/** Roles excluded from hacker stats. */
export const ADMIN_ROLES_EXCLUDED_FROM_STATS: string[] = ['admin', 'owner'];

export function hasAdminAccess(role: string | null | undefined): boolean {
    return role === 'admin' || role === 'owner';
}

export function isOwner(role: string | null | undefined): boolean {
    return role === 'owner';
}
