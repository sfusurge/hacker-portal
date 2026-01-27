import { NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import path from 'node:path';

type CsvOption = { value: string; name: string };

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const ALLOWED_FILES = ['majors', 'schools', 'countries'] as const;
const FILES_WITH_HEADER = ['majors', 'schools'] as const;

const cache = new Map<string, { data: CsvOption[]; expires: number }>();

function parseCSV(text: string, skipHeader: boolean): CsvOption[] {
    const lines = skipHeader ? text.split('\n').slice(1) : text.split('\n');
    const ans: CsvOption[] = [];
    const seen = new Set<string>();

    for (let line of lines) {
        line = line.replaceAll('"', '').trim();
        if (!line) continue;

        const key = line.toLowerCase();
        if (seen.has(key)) continue;

        seen.add(key);
        ans.push({ value: line, name: line });
    }
    return ans;
}

async function getCsvData(filename: string): Promise<CsvOption[]> {
    if (!ALLOWED_FILES.includes(filename as any)) {
        throw new Error(`File ${filename} is not allowed`);
    }

    const now = Date.now();
    const cached = cache.get(filename);

    if (cached && now < cached.expires) {
        return cached.data;
    }

    const filePath = path.join(process.cwd(), 'public', `${filename}.csv`);
    const text = readFileSync(filePath, 'utf-8');
    const skipHeader = FILES_WITH_HEADER.includes(filename as any);
    const data = parseCSV(text, skipHeader);

    cache.set(filename, {
        data,
        expires: now + CACHE_DURATION,
    });

    return data;
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params;

        if (!ALLOWED_FILES.includes(filename as any)) {
            return NextResponse.json(
                { message: `File ${filename} is not allowed` },
                { status: 400 }
            );
        }

        const { searchParams } = new URL(req.url);

        const q = (searchParams.get('query') || '').toLowerCase();

        let limit = Number(searchParams.get('limit')) || 20;
        let offset = Number(searchParams.get('offset')) || 0;

        if (limit < 1) limit = 1;
        if (limit > 200) limit = 200;
        if (offset < 0) offset = 0;

        const data = await getCsvData(filename);

        const filtered = q
            ? data.filter((item) => item.name.toLowerCase().includes(q))
            : data;

        const paged = filtered.slice(offset, offset + limit);

        return NextResponse.json(paged);
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
