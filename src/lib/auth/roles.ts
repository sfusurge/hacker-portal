/** Role helpers shared by server and client. Owner includes admin access. */

/** Roles excluded from stats (admin accounts). */
export const ADMIN_ROLES_EXCLUDED_FROM_STATS: string[] = [
    'admin',
    'owner',
    'judge',
    'sponsor',
];

export function hasAdminAccess(role: string | null | undefined): boolean {
    return role === 'admin' || role === 'owner';
}

export function isOwner(role: string | null | undefined): boolean {
    return role === 'owner';
}
