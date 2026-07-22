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

//check if drop down or free text
const MAJOR_ALIASES: Record<string, string> = {
    cs: 'Computer Science',
    'comp sci': 'Computer Science',
    'computer sci': 'Computer Science',
    ee: 'Electrical Engineering',
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

function ensureMajorList(): Map<string, string> {
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
export function answersToCountKeys(
    value: unknown,
    role: DemographicStatRole
): string[] {
    if (value == null || value === '') {
        return ['Not specified'];
    }

    if (Array.isArray(value)) {
        const parts = value
            .map((item) =>
                typeof item === 'string'
                    ? canonicalizeFreeText(item, role)
                    : canonicalizeFreeText(String(item), role)
            )
            .filter((s) => s && s !== 'Not specified');
        return parts.length > 0 ? parts : ['Not specified'];
    }

    if (typeof value === 'string' || typeof value === 'number') {
        return [canonicalizeFreeText(String(value), role)];
    }

    return [canonicalizeFreeText(String(value), role)];
}
