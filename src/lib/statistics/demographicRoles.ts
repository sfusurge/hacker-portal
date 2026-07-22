import type { DisplayRole } from '@/components/application_components/types';

export const DEMOGRAPHIC_STAT_ROLES = [
    'pronouns',
    'age',
    'school',
    'education',
    'yearOfStudy',
    'major',
    'priorHackathons',
] as const satisfies readonly DisplayRole[];

export type DemographicStatRole = (typeof DEMOGRAPHIC_STAT_ROLES)[number];

export const DEMOGRAPHIC_CHART_LABELS: Record<DemographicStatRole, string> = {
    pronouns: 'Pronouns',
    age: 'Age',
    school: 'School',
    education: 'Level of Study',
    yearOfStudy: 'Year of Study',
    major: 'Major / Program',
    priorHackathons: 'Hackathon Experience',
};

export const DEMOGRAPHIC_CHART_DESCRIPTIONS: Record<
    DemographicStatRole,
    string
> = {
    pronouns: 'Applicant pronouns',
    age: 'Applicant age distribution',
    school: 'Participant distribution by institution',
    education: 'Distribution of academic levels',
    yearOfStudy: 'Year of study distribution',
    major: 'Program / major distribution',
    priorHackathons: 'Previous hackathon participation',
};
