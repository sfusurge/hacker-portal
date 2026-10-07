import type { DisplayRole } from '@/components/application_components/types';

export const DEMOGRAPHIC_STAT_ROLES = [
    'school',
    'education',
    'major',
    'yearOfStudy',
    'pronouns',
    'priorHackathons',
    'age',
] as const satisfies readonly DisplayRole[];

export type DemographicStatRole = (typeof DEMOGRAPHIC_STAT_ROLES)[number];

export const DEMOGRAPHIC_CHART_LABELS: Record<DemographicStatRole, string> = {
    school: 'School',
    education: 'Level of Study',
    major: 'Majors',
    yearOfStudy: 'Year of Study',
    pronouns: 'Pronouns',
    priorHackathons: 'Hackathon Experience',
    age: 'Age',
};

export const DEMOGRAPHIC_CHART_DESCRIPTIONS: Record<
    DemographicStatRole,
    string
> = {
    school: 'Participant distribution by institution',
    education: 'Distribution of academic levels',
    major: 'Program / major distribution',
    yearOfStudy: 'Year of study distribution',
    pronouns: 'Applicant pronouns',
    priorHackathons: 'Previous hackathon participation',
    age: 'Applicant age distribution',
};
