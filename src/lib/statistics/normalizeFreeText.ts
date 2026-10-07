import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { DemographicStatRole } from './demographicRoles';

/** Roles that benefit from free-text / CSV canonicalization */
const FREE_TEXT_ROLES = new Set<DemographicStatRole>(['school', 'major']);

/** Common short forms → preferred display name */
const SCHOOL_ALIASES: Record<string, string> = {
    ubc: 'University of British Columbia',
    'u of bc': 'University of British Columbia',
    'university of bc': 'University of British Columbia',
    ubcv: 'University of British Columbia',
    ubco: 'University of British Columbia Okanagan',
    sfu: 'Simon Fraser University',
    uvic: 'University of Victoria',
    uoft: 'University of Toronto',
    'u of t': 'University of Toronto',
    'u of toronto': 'University of Toronto',
    waterloo: 'University of Waterloo',
    uwat: 'University of Waterloo',
};

/**
 * StormHacks-style major dropdown `data` keys → human choice labels.
 * Keep stats on the form's normal selection text (no LLM / free-text canon).
 */
const MAJOR_SELECTION_LABELS: Record<string, string> = {
    computer_science:
        'Computer science, computer engineering, or software engineering',
    engineering:
        'Another engineering discipline (such as civil, electrical, mechanical, etc.)',
    information_systems:
        'Information systems, information technology, or system administration',
    natural_science:
        'A natural science (such as biology, chemistry, physics, etc.)',
    mathematics_statistics: 'Mathematics or statistics',
    web_development_design: 'Web development or web design',
    business_discipline:
        'Business discipline (such as accounting, finance, marketing, etc.)',
    humanities_discipline:
        'Humanities discipline (such as literature, history, philosophy, etc.)',
    social_science:
        'Social science (such as anthropology, psychology, political science, etc.)',
    fine_arts_performing_arts:
        'Fine arts or performing arts (such as graphic design, music, studio art, etc.)',
    health_science:
        'Health science (such as nursing, pharmacy, radiology, etc.)',
    other: 'Other (please specify)',
    undecided: 'Undecided / No Declared Major',
    no_majors_offered:
        'My school does not offer majors / primary areas of study',
    prefer_not_to_answer: 'Prefer not to answer',
};

export const MAJOR_ALIASES: Record<string, string> = {
    cs: 'Computer Science',
    'comp sci': 'Computer Science',
    'computer sci': 'Computer Science',
    ee: 'Electrical Engineering',
    ...MAJOR_SELECTION_LABELS,
};

type CanonList = { byKey: Map<string, string>; loaded: boolean };

const schoolList: CanonList = { byKey: new Map(), loaded: false };
const majorList: CanonList = { byKey: new Map(), loaded: false };

export function normalizeKey(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ');
}

function loadCsvNames(filename: 'schools' | 'majors'): Map<string, string> {
    const filePath = path.join(process.cwd(), 'public', `${filename}.csv`);
    const text = readFileSync(filePath, 'utf-8');
    // schools.csv and majors.csv start with a header / note line
    const lines = text.split('\n').slice(1);
    const byKey = new Map<string, string>();

    for (let line of lines) {
        line = line.replaceAll('"', '').trim();
        if (!line) continue;
        const key = normalizeKey(line);
        if (!byKey.has(key)) {
            byKey.set(key, line);
        }
    }
    return byKey;
}

function ensureSchoolList(): Map<string, string> {
    if (!schoolList.loaded) {
        schoolList.byKey = loadCsvNames('schools');
        schoolList.loaded = true;
    }
    return schoolList.byKey;
}

export function ensureMajorList(): Map<string, string> {
    if (!majorList.loaded) {
        majorList.byKey = loadCsvNames('majors');
        majorList.loaded = true;
    }
    return majorList.byKey;
}

function titleCaseFallback(raw: string): string {
    const cleaned = raw.trim().replace(/\s+/g, ' ');
    if (!cleaned) return 'Not specified';
    return cleaned;
}

export function titleCaseMajor(raw: string): string {
    return titleCaseFallback(raw);
}

export function polishCanonicalMajor(display: string): string {
    return display.trim().replace(/\s+/g, ' ');
}

export function tryStrongMajorMatch(raw: string): string | null {
    const key = normalizeKey(raw);
    if (MAJOR_ALIASES[key]) return MAJOR_ALIASES[key];
    return ensureMajorList().get(key) ?? null;
}

/**
 * Map a raw answer string to a stable pie-slice label.
 * For non free-text roles, just clean whitespace / empty → Not specified.
 */
export function canonicalizeFreeText(
    raw: string,
    role: DemographicStatRole
): string {
    const trimmed = raw.trim();
    if (!trimmed) return 'Not specified';

    if (!FREE_TEXT_ROLES.has(role)) {
        return trimmed;
    }

    const key = normalizeKey(trimmed);
    const aliases = role === 'school' ? SCHOOL_ALIASES : MAJOR_ALIASES;
    if (aliases[key]) return aliases[key];

    const list = role === 'school' ? ensureSchoolList() : ensureMajorList();
    const exact = list.get(key);
    if (exact) return exact;

    // Weak includes match: first CSV entry that contains the key or vice versa
    for (const [csvKey, display] of list) {
        if (csvKey.includes(key) || key.includes(csvKey)) {
            return display;
        }
    }

    return titleCaseFallback(trimmed);
}

/**
 * Turn one applicant's raw answer into one or more count keys.
 * - major may be string[]
 * - empty → ["Not specified"]
 */
function coerceAnswerList(value: unknown): unknown[] {
    if (value == null || value === '') return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.startsWith('[')) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) return parsed;
            } catch {
                // fall through — treat as a plain string answer
            }
        }
        return [trimmed];
    }
    return [value];
}

export function answersToCountKeys(
    value: unknown,
    role: DemographicStatRole,
    /** Optional form choice data → label map (preferred for dropdown majors). */
    choiceLabels?: Map<string, string> | Record<string, string>
): string[] {
    const labelMap =
        choiceLabels instanceof Map
            ? choiceLabels
            : choiceLabels
              ? new Map(Object.entries(choiceLabels))
              : null;

    const resolveOne = (raw: string): string => {
        const trimmed = raw.trim();
        if (!trimmed) return 'Not specified';
        if (labelMap?.has(trimmed)) return labelMap.get(trimmed)!;
        // also try normalized underscore keys against major selection labels
        if (role === 'major' && MAJOR_SELECTION_LABELS[trimmed]) {
            return MAJOR_SELECTION_LABELS[trimmed];
        }
        return canonicalizeFreeText(trimmed, role);
    };

    const items = coerceAnswerList(value);
    if (items.length === 0) return ['Not specified'];

    const parts = items
        .map((item) =>
            resolveOne(typeof item === 'string' ? item : String(item))
        )
        .filter((s) => s && s !== 'Not specified');
    return parts.length > 0 ? parts : ['Not specified'];
}
