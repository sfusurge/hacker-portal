import { NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import path from 'node:path';
// const schoolsUrl = `https://www.statcan.gc.ca/en/subjects/standard/cip/2021/index`;

type majorOption = { value: string; name: string };

let cache: majorOption[] | null = null;
let nextRefresh = Date.now();

function parseCSV(text: string) {
    const schoolNames = text.split('\n').slice(1);
    let ans: majorOption[] = [];
    const seen = new Set();

    for (let major of schoolNames) {
        major = major.replaceAll('"', '').trim();
        if (!major) continue;

        const key = major.toLowerCase();
        if (seen.has(key)) continue;

        seen.add(key);
        ans.push({ value: major, name: major });
    }
    return ans;
}

async function getMajors() {
    const now = Date.now();
    if (cache && now < nextRefresh) return cache;

    const schoolsUrl = path.join(process.cwd(), 'public', 'majors.csv');
    const text = readFileSync(schoolsUrl, 'utf-8');

    cache = parseCSV(text);
    nextRefresh = now + 24 * 60 * 60 * 1000;
    return cache;
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const q = (searchParams.get('query') || '').toLowerCase();

        let limit = Number(searchParams.get('limit')) || 20;
        let offset = Number(searchParams.get('offset')) || 0;

        if (limit < 1) limit = 1;
        if (limit > 200) limit = 200;
        if (offset < 0) offset = 0;

        const majors = await getMajors();

        // filter first, then paginate
        const filtered = q
            ? majors.filter((s) => s.name.toLowerCase().includes(q))
            : majors;

        // apply offset + limit
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
