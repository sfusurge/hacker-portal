import { inArray, sql } from 'drizzle-orm';
import { databaseClient } from '@/db/client';
import {
    majorMappings,
    type MajorMappingSource,
} from '@/db/schema/majorMappings';
import { getOpenRouterApiKey, openRouterChat } from '@/lib/ai/openrouter';
import {
    ensureMajorList,
    MAJOR_ALIASES,
    normalizeKey,
    polishCanonicalMajor,
    titleCaseMajor,
    tryStrongMajorMatch,
} from './normalizeFreeText';

const FUZZY_THRESHOLD = 0.85;

export type ResolvedMajor = {
    rawKey: string;
    rawText: string;
    canonical: string;
    source: MajorMappingSource;
    confidence: number | null;
};

function bigrams(s: string): Map<string, number> {
    const map = new Map<string, number>();
    const padded = ` ${s} `;
    for (let i = 0; i < padded.length - 1; i++) {
        const gram = padded.slice(i, i + 2);
        map.set(gram, (map.get(gram) ?? 0) + 1);
    }
    return map;
}

/** Dice coefficient on character bigrams (0–1). */
export function diceCoefficient(a: string, b: string): number {
    if (a === b) return 1;
    if (a.length < 2 || b.length < 2) return 0;

    const aGrams = bigrams(a);
    const bGrams = bigrams(b);
    let overlap = 0;
    let aTotal = 0;
    let bTotal = 0;

    for (const count of aGrams.values()) aTotal += count;
    for (const count of bGrams.values()) bTotal += count;

    for (const [gram, aCount] of aGrams) {
        const bCount = bGrams.get(gram);
        if (bCount) overlap += Math.min(aCount, bCount);
    }

    return (2 * overlap) / (aTotal + bTotal);
}

function bestFuzzyMatch(
    key: string,
    taxonomy: Array<{ key: string; display: string }>
): { display: string; score: number } | null {
    let best: { display: string; score: number } | null = null;

    for (const entry of taxonomy) {
        const score = diceCoefficient(key, entry.key);
        if (!best || score > best.score) {
            best = { display: entry.display, score };
        }
    }

    if (!best || best.score < FUZZY_THRESHOLD) return null;
    return best;
}

function loadTaxonomyEntries(): Array<{ key: string; display: string }> {
    const list = ensureMajorList();
    const entries: Array<{ key: string; display: string }> = [];
    for (const [key, display] of list) {
        entries.push({ key, display: polishCanonicalMajor(display) });
    }
    for (const canonical of new Set(Object.values(MAJOR_ALIASES))) {
        const key = normalizeKey(canonical);
        if (!entries.some((e) => e.key === key)) {
            entries.push({ key, display: canonical });
        }
    }
    return entries;
}

async function loadCachedMappings(
    rawKeys: string[]
): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    if (rawKeys.length === 0) return result;

    const rows = await databaseClient
        .select({
            rawKey: majorMappings.rawKey,
            canonical: majorMappings.canonical,
        })
        .from(majorMappings)
        .where(inArray(majorMappings.rawKey, rawKeys));

    for (const row of rows) {
        result.set(row.rawKey, row.canonical);
    }
    return result;
}

async function upsertMappings(rows: ResolvedMajor[]): Promise<void> {
    if (rows.length === 0) return;

    const now = new Date();
    const chunkSize = 50;
    for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        await databaseClient
            .insert(majorMappings)
            .values(
                chunk.map((row) => ({
                    rawKey: row.rawKey,
                    rawText: row.rawText,
                    canonical: row.canonical,
                    source: row.source,
                    confidence: row.confidence,
                    createdAt: now,
                    updatedAt: now,
                }))
            )
            .onConflictDoUpdate({
                target: majorMappings.rawKey,
                set: {
                    canonical: sql`excluded.canonical`,
                    source: sql`excluded.source`,
                    confidence: sql`excluded.confidence`,
                    rawText: sql`excluded.raw_text`,
                    updatedAt: now,
                },
            });
    }
}

async function classifyWithLlm(
    unknowns: Array<{ rawKey: string; rawText: string }>
): Promise<ResolvedMajor[]> {
    if (unknowns.length === 0) return [];

    const aliasHints = Object.entries(MAJOR_ALIASES)
        .slice(0, 40)
        .map(([k, v]) => `"${k}" → "${v}"`)
        .join('; ');

    const content = await openRouterChat({
        responseFormat: 'json_object',
        temperature: 0,
        messages: [
            {
                role: 'system',
                content: `You canonicalize university major / program names for hackathon demographics.
Return JSON only: {"mappings":[{"raw":"...","canonical":"..."}]}
Rules:
- Prefer short, stable display names (e.g. "Computer Science", "Data Science").
- Merge SFU "Computing Science" / "CPSC" / "CS" into "Computer Science".
- Merge "Software System(s)" into "Software Systems".
- Merge SIAT / Interactive Arts & Technology variants into "Interactive Arts and Technology".
- Merge ENSC into "Engineering Science"; MSE/mechatronics variants into "Mechatronics Systems Engineering".
- Strip CIP suffixes like ", general" / ", other".
- Normalize & to "and" in display names when needed.
- If unsure, use a concise Title Case label — never empty.
Known aliases: ${aliasHints}`,
            },
            {
                role: 'user',
                content: JSON.stringify({
                    values: unknowns.map((u) => u.rawText),
                }),
            },
        ],
    });

    let parsed: { mappings?: Array<{ raw?: string; canonical?: string }> };
    try {
        parsed = JSON.parse(content) as typeof parsed;
    } catch {
        console.error('Failed to parse OpenRouter major mappings JSON');
        return [];
    }

    const byRawKey = new Map(unknowns.map((u) => [u.rawKey, u] as const));
    const byRawText = new Map(
        unknowns.map((u) => [normalizeKey(u.rawText), u] as const)
    );

    const resolved: ResolvedMajor[] = [];
    for (const item of parsed.mappings ?? []) {
        if (!item?.raw || !item?.canonical?.trim()) continue;
        const match =
            byRawKey.get(normalizeKey(item.raw)) ??
            byRawText.get(normalizeKey(item.raw));
        if (!match) continue;

        resolved.push({
            rawKey: match.rawKey,
            rawText: match.rawText,
            canonical: polishCanonicalMajor(item.canonical),
            source: 'llm',
            confidence: null,
        });
    }

    return resolved;
}

/**
 * Resolve raw major strings → canonical labels.
 * Pipeline: DB cache → hard alias/CSV → fuzzy → OpenRouter batch → title-case fallback.
 * New classifications are upserted into major_mappings.
 */
export async function resolveMajors(
    rawStrings: string[]
): Promise<Map<string, string>> {
    const uniqueByKey = new Map<string, string>();
    for (const raw of rawStrings) {
        const trimmed = raw.trim();
        if (!trimmed) continue;
        const key = normalizeKey(trimmed);
        if (!key) continue;
        if (!uniqueByKey.has(key)) {
            uniqueByKey.set(key, trimmed);
        }
    }

    const result = new Map<string, string>();
    if (uniqueByKey.size === 0) return result;

    const rawKeys = [...uniqueByKey.keys()];
    const cached = await loadCachedMappings(rawKeys);

    const pending: Array<{ rawKey: string; rawText: string }> = [];
    for (const [rawKey, rawText] of uniqueByKey) {
        const hit = cached.get(rawKey);
        if (hit) {
            result.set(rawKey, hit);
        } else {
            pending.push({ rawKey, rawText });
        }
    }

    if (pending.length === 0) return result;

    const taxonomy = loadTaxonomyEntries();
    const toWrite: ResolvedMajor[] = [];
    const needsLlm: Array<{ rawKey: string; rawText: string }> = [];

    for (const item of pending) {
        const aliasHit = tryStrongMajorMatch(item.rawText);
        if (aliasHit) {
            const resolved: ResolvedMajor = {
                rawKey: item.rawKey,
                rawText: item.rawText,
                canonical: aliasHit,
                source: 'alias',
                confidence: 1,
            };
            toWrite.push(resolved);
            result.set(item.rawKey, aliasHit);
            continue;
        }

        const fuzzy = bestFuzzyMatch(item.rawKey, taxonomy);
        if (fuzzy) {
            const canonical = polishCanonicalMajor(fuzzy.display);
            const resolved: ResolvedMajor = {
                rawKey: item.rawKey,
                rawText: item.rawText,
                canonical,
                source: 'fuzzy',
                confidence: fuzzy.score,
            };
            toWrite.push(resolved);
            result.set(item.rawKey, canonical);
            continue;
        }

        needsLlm.push(item);
    }

    if (needsLlm.length > 0 && getOpenRouterApiKey()) {
        try {
            const llmResolved = await classifyWithLlm(needsLlm);
            const llmKeys = new Set(llmResolved.map((r) => r.rawKey));
            for (const row of llmResolved) {
                toWrite.push(row);
                result.set(row.rawKey, row.canonical);
            }
            // Uncached title-case fallback so a later run can still try LLM
            for (const item of needsLlm) {
                if (llmKeys.has(item.rawKey)) continue;
                result.set(item.rawKey, titleCaseMajor(item.rawText));
            }
        } catch (error) {
            console.error('OpenRouter major classification failed:', error);
            for (const item of needsLlm) {
                const fallback = titleCaseMajor(item.rawText);
                result.set(item.rawKey, fallback);
            }
        }
    } else {
        for (const item of needsLlm) {
            const fallback = titleCaseMajor(item.rawText);
            // Don't cache weak title-case fallbacks as alias; leave for next LLM run
            result.set(item.rawKey, fallback);
        }
    }

    try {
        await upsertMappings(toWrite);
    } catch (error) {
        console.error('Failed to upsert major_mappings:', error);
    }

    return result;
}

/** Map raw answer values to canonical major labels using a precomputed map. */
export function mapRawMajorsToCanonical(
    rawValues: string[],
    resolved: Map<string, string>
): string[] {
    if (rawValues.length === 0) return ['Not specified'];

    const keys = rawValues
        .map((raw) => {
            const key = normalizeKey(raw);
            return resolved.get(key) ?? titleCaseMajor(raw);
        })
        .filter((s) => s && s !== 'Not specified');

    return keys.length > 0 ? keys : ['Not specified'];
}
