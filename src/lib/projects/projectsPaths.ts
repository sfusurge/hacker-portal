import slugify from '@/utils/slugify';

export const PUBLIC_PROJECTS_PATH = '/projects';

/** Public SparkJam judge gallery (no auth). */
export const SPARKJAM_PROJECTS_BASE = '/sparkjam';
export const SPARKJAM_PROJECTS_PATH = `${SPARKJAM_PROJECTS_BASE}/projects`;

/** @deprecated Use SPARKJAM_PROJECTS_PATH */
export const JUDGE_PROJECTS_PATH = SPARKJAM_PROJECTS_PATH;

export function isSparkjamProjectsArea(pathname: string): boolean {
    return (
        pathname === SPARKJAM_PROJECTS_BASE ||
        pathname.startsWith(`${SPARKJAM_PROJECTS_BASE}/`)
    );
}

export function projectDetailPath(
    teamNameOrId: string | number,
    basePath: string = PUBLIC_PROJECTS_PATH
): string {
    const segment =
        typeof teamNameOrId === 'number'
            ? String(teamNameOrId)
            : slugify(String(teamNameOrId));
    return `${basePath}/${segment}`;
}
