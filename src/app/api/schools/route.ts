import { NextResponse } from 'next/server';
import { send } from 'process';
import { readFileSync } from 'node:fs';
// const schoolsUrl = `https://raw.githubusercontent.com/MLH/mlh-policies/main/schools.csv`;
import path from 'node:path';
type schoolOption = { value: string; name: string };

let cache: schoolOption[] | null = null;
let nextRefresh = Date.now();

function parseCSV(text: string) {
    const schoolNames = text.split('\n').slice(1);
    let ans: schoolOption[] = [];
    const seen = new Set();

    for (let school of schoolNames) {
        school = school.replaceAll('"', '').trim();
        const key = school.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        ans.push({ value: school, name: school });
    }
    return ans;
}

async function getSchools() {
    let now = Date.now();
    if (cache != null && now < nextRefresh) return cache;

    // const res = await fetch(schoolsUrl, { cache: 'no-store' });
    // const text = await res.text();
    const schoolsUrl = path.join(process.cwd(), 'public', 'schools.csv');
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
        if (limit < 1) limit = 1;
        if (limit > 200) limit = 200;

        const schools = await getSchools();

        const filtered = q
            ? schools
                  .filter((s) => s.name.toLowerCase().includes(q))
                  .slice(0, limit)
            : schools.slice(0, limit);
        return NextResponse.json(filtered);
    } catch {
        if (cache) return NextResponse.json(cache);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
