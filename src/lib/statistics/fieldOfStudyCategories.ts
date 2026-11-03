import { normalizeKey } from './normalizeFreeText';
import { getOpenRouterApiKey, openRouterChat } from '@/lib/ai/openrouter';

/**
 * MLH-style Major / Field of Study buckets used for statistics.
 * Exact labels are preserved for chart display.
 */
export const FIELD_OF_STUDY_CATEGORIES = [
    'Computer science, computer engineering, or software engineering',
    'Another engineering discipline (such as civil, electrical, mechanical, etc.)',
    'Information systems, information technology, or system administration',
    'A natural science (such as biology, chemistry, physics, etc.)',
    'Mathematics or statistics',
    'Web development or web design',
    'Business discipline (such as accounting, finance, marketing, etc.)',
    'Humanities discipline (such as literature, history, philosophy, etc.)',
    'Social science (such as anthropology, psychology, political science, etc.)',
    'Fine arts or performing arts (such as graphic design, music, studio art, etc.)',
    'Health science (such as nursing, pharmacy, radiology, etc.)',
    'Other (please specify)',
    'Undecided / No Declared Major',
    'My school does not offer majors / primary areas of study',
    'Prefer not to answer',
] as const;

export type FieldOfStudyCategory = (typeof FIELD_OF_STUDY_CATEGORIES)[number];

const CATEGORY_BY_KEY = new Map(
    FIELD_OF_STUDY_CATEGORIES.map((label) => [normalizeKey(label), label])
);

const CATEGORY_SET = new Set<string>(FIELD_OF_STUDY_CATEGORIES);

/** Short / alternate phrases that already mean a category */
const CATEGORY_ALIASES: Record<string, FieldOfStudyCategory> = {
    'prefer not to answer': 'Prefer not to answer',
    'prefer not': 'Prefer not to answer',
    'n a': 'Prefer not to answer',
    na: 'Prefer not to answer',
    'not specified': 'Prefer not to answer',
    'not applicable': 'Prefer not to answer',
    undecided: 'Undecided / No Declared Major',
    'no declared major': 'Undecided / No Declared Major',
    undeclared: 'Undecided / No Declared Major',
    'no major': 'Undecided / No Declared Major',
    'general studies': 'Undecided / No Declared Major',
    'liberal arts':
        'Humanities discipline (such as literature, history, philosophy, etc.)',
    'my school does not offer majors primary areas of study':
        'My school does not offer majors / primary areas of study',
    'does not offer majors':
        'My school does not offer majors / primary areas of study',
    other: 'Other (please specify)',
    'please specify': 'Other (please specify)',
};

type Rule = { category: FieldOfStudyCategory; patterns: RegExp[] };

/**
 * Ordered rules: first match wins. CS/software before general engineering.
 */
const KEYWORD_RULES: Rule[] = [
    {
        category:
            'Computer science, computer engineering, or software engineering',
        patterns: [
            /\b(computer science|computing science|computing sciences|cpsc|comp sci)\b/i,
            /\b(software engineering|software systems?|software system)\b/i,
            /\b(computer engineering|computer eng)\b/i,
            /\b(data science|big data|machine learning|artificial intelligence)\b/i,
            /\b(cognitive systems?|bioinformatics|computational)\b/i,
            /\b(game (?:programming|development|dev)|programming)\b/i,
            /\b(robotics)\b/i,
        ],
    },
    {
        category: 'Web development or web design',
        patterns: [
            /\b(web development|web design|full[ -]?stack|front[ -]?end|back[ -]?end)\b/i,
            /\b(new media design|ui[ \/]?ux|ux[ \/]?ui|user experience|user interface)\b/i,
        ],
    },
    {
        category:
            'Information systems, information technology, or system administration',
        patterns: [
            /\b(information systems?|information technology|system administration)\b/i,
            /\b(computer systems? technology|computer information systems|\bcst\b)\b/i,
            /\b(cybersecurity|cyber security|digital forensics|network(?:ing)?|sysadmin)\b/i,
            /\b(management information systems|\bmis\b)\b/i,
            /\b(tech(?:nology)? support|help ?desk)\b/i,
        ],
    },
    {
        category:
            'Another engineering discipline (such as civil, electrical, mechanical, etc.)',
        patterns: [
            /\b(electrical|electronics|mechanical|civil|chemical|biomedical|mechatronics|aerospace|industrial|environmental|sustainable energy|engineering science|ensc|mse|materials|nuclear|petroleum|mining|geological engineering)\b/i,
            /\bengineering\b/i,
            /\bpre[ -]?engineering\b/i,
            /\barchitecture\b/i,
        ],
    },
    {
        category: 'Mathematics or statistics',
        patterns: [
            /\b(mathematics|mathematical|stats?|statistics|applied math|actuarial)\b/i,
            /\bdata analytics\b/i,
        ],
    },
    {
        category:
            'A natural science (such as biology, chemistry, physics, etc.)',
        patterns: [
            /\b(biology|biological|chemistry|biochem|physics|astronomy|geology|earth science|environmental science|natural science|ecology|zoology|botany|marine|oceanograph|agriculture|agricultural|horticulture|forestry|soil)\b/i,
        ],
    },
    {
        category:
            'Business discipline (such as accounting, finance, marketing, etc.)',
        patterns: [
            /\b(business|accounting|finance|marketing|commerce|management|mba|bba|economics|entrepreneur|supply chain|human resources|\bhr\b|operations)\b/i,
        ],
    },
    {
        category: 'Health science (such as nursing, pharmacy, radiology, etc.)',
        patterns: [
            /\b(nursing|pharmacy|radiology|health|medicine|medical|kinesiology|public health|pre[ -]?med|dental|veterinary|nutrition|dietetics|therapy|physiotherapy|occupational therapy)\b/i,
        ],
    },
    {
        category:
            'Social science (such as anthropology, psychology, political science, etc.)',
        patterns: [
            /\b(anthropology|psychology|political|sociology|geography|criminology|international relations|social science|social work|gender studies|cultural studies|urban planning|public policy|education|teaching|pedagogy)\b/i,
        ],
    },
    {
        category:
            'Humanities discipline (such as literature, history, philosophy, etc.)',
        patterns: [
            /\b(literature|history|philosophy|english|linguistics|humanities|classics|religion|communications?|journalism|media studies|creative writing|languages?|french|spanish|japanese|chinese)\b/i,
        ],
    },
    {
        category:
            'Fine arts or performing arts (such as graphic design, music, studio art, etc.)',
        patterns: [
            /\b(graphic design|fine arts?|performing arts?|studio art|visual arts?)\b/i,
            /\b(music|film|theatre|theater|dance|animation|illustration|photography|fashion)\b/i,
            /\b(interactive arts|siat|game design|industrial design|interior design|product design)\b/i,
            /\bdesign\b/i,
        ],
    },
];

function matchCategoryLabel(key: string): FieldOfStudyCategory | null {
    const exact = CATEGORY_BY_KEY.get(key);
    if (exact) return exact;

    // Only prefix-match against known category labels (avoid substring false positives)
    for (const label of FIELD_OF_STUDY_CATEGORIES) {
        const labelKey = normalizeKey(label);
        if (key.length >= 16 && labelKey.startsWith(key)) return label;
        if (key.length >= 20 && key.startsWith(labelKey.slice(0, 28))) {
            return label;
        }
    }
    return null;
}

/**
 * Map a raw or canonical major string to a field-of-study category (rules only).
 */
export function toFieldOfStudyCategory(input: string): FieldOfStudyCategory {
    const trimmed = input.trim();
    if (!trimmed) return 'Prefer not to answer';

    const key = normalizeKey(trimmed);

    const alias = CATEGORY_ALIASES[key];
    if (alias) return alias;

    const labelHit = matchCategoryLabel(key);
    if (labelHit) return labelHit;

    for (const rule of KEYWORD_RULES) {
        for (const pattern of rule.patterns) {
            if (pattern.test(trimmed)) {
                return rule.category;
            }
        }
    }

    return 'Other (please specify)';
}

function parseCategory(value: string): FieldOfStudyCategory | null {
    const trimmed = value.trim();
    if (CATEGORY_SET.has(trimmed)) {
        return trimmed as FieldOfStudyCategory;
    }
    const byKey = CATEGORY_BY_KEY.get(normalizeKey(trimmed));
    return byKey ?? null;
}

async function classifyOthersWithLlm(
    values: string[]
): Promise<Map<string, FieldOfStudyCategory>> {
    const result = new Map<string, FieldOfStudyCategory>();
    if (values.length === 0 || !getOpenRouterApiKey()) return result;

    const categoryList = FIELD_OF_STUDY_CATEGORIES.map((c) => `- ${c}`).join(
        '\n'
    );

    try {
        const content = await openRouterChat({
            responseFormat: 'json_object',
            temperature: 0,
            messages: [
                {
                    role: 'system',
                    content: `You classify university majors into exactly one of these categories.
Return JSON only: {"mappings":[{"raw":"...","category":"..."}]}
The category value MUST be copied exactly from this list:
${categoryList}
Prefer a real discipline bucket over "Other (please specify)" when a reasonable fit exists.
Use "Prefer not to answer" only for refusals / N/A.
Use "Undecided / No Declared Major" for undeclared / general studies without a field.`,
                },
                {
                    role: 'user',
                    content: JSON.stringify({ values }),
                },
            ],
        });

        const parsed = JSON.parse(content) as {
            mappings?: Array<{ raw?: string; category?: string }>;
        };

        const byKey = new Map(values.map((v) => [normalizeKey(v), v] as const));

        for (const item of parsed.mappings ?? []) {
            if (!item?.raw || !item?.category) continue;
            const match =
                byKey.get(normalizeKey(item.raw)) ??
                values.find((v) => normalizeKey(v) === normalizeKey(item.raw!));
            if (!match) continue;
            const category = parseCategory(item.category);
            if (category) {
                result.set(normalizeKey(match), category);
            }
        }
    } catch (error) {
        console.error('Field-of-study LLM classification failed:', error);
    }

    return result;
}

/**
 * Resolve majors → field-of-study categories.
 * Rules first; remaining "Other" values get one batched OpenRouter classify.
 */
export async function resolveFieldOfStudyCategories(
    majors: string[]
): Promise<Map<string, FieldOfStudyCategory>> {
    const resolved = new Map<string, FieldOfStudyCategory>();
    const unique = new Map<string, string>();

    for (const major of majors) {
        const trimmed = major.trim();
        if (!trimmed) continue;
        const key = normalizeKey(trimmed);
        if (!unique.has(key)) unique.set(key, trimmed);
    }

    const needsLlm: string[] = [];

    for (const [key, text] of unique) {
        const category = toFieldOfStudyCategory(text);
        resolved.set(key, category);
        if (
            category === 'Other (please specify)' &&
            normalizeKey(text) !== normalizeKey('Other (please specify)') &&
            normalizeKey(text) !== 'other'
        ) {
            needsLlm.push(text);
        }
    }

    if (needsLlm.length > 0) {
        const llmMap = await classifyOthersWithLlm(needsLlm);
        for (const [key, category] of llmMap) {
            resolved.set(key, category);
        }
    }

    return resolved;
}

export function mapMajorsToFieldOfStudy(
    majors: string[],
    categoryByKey?: Map<string, FieldOfStudyCategory>
): string[] {
    if (majors.length === 0) return ['Prefer not to answer'];

    return majors.map((major) => {
        const key = normalizeKey(major);
        if (categoryByKey?.has(key)) {
            return categoryByKey.get(key)!;
        }
        return toFieldOfStudyCategory(major);
    });
}
