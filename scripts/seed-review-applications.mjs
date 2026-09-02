// Usage: node --env-file=.env scripts/seed-review-applications.mjs [count] [hackathonId]
import postgres from 'postgres';
import { faker } from '@faker-js/faker';

const sql = postgres(process.env.DBURL, { max: 1 });
const N = parseInt(process.argv[2] ?? '40', 10);
const requestedHackId = process.argv[3] ? parseInt(process.argv[3], 10) : null;

const userRNGParams = { a: 29, b: 97, m: 917504, seed: 173429 };
const teamRNGParams = { a: 57, b: 59, m: 917504, seed: 295219 };

function powerMod(b, e, m) {
    if (m === 1) return 0;
    let r = 1;
    while (e > 0) {
        if (e % 2 === 1) r = (r * b) % m;
        b = (b * b) % m;
        e >>= 1;
    }
    return r;
}

function LCG_at_N(n, a, b, m, seed) {
    const multi = (seed * powerMod(a, n, m)) % m;
    const p = (a - 1) * m;
    const incre = (b * ((powerMod(a, n, p) - 1) % p)) / (a - 1);
    return Math.floor(multi + incre) % m;
}

function getSixDigitId(n, param) {
    return `${LCG_at_N(n, param.a, param.b, param.m, param.seed)}`.padStart(
        6,
        '0'
    );
}

function flattenQuestions(pages) {
    const out = [];
    for (const page of pages ?? []) {
        for (const q of page.questions ?? []) {
            if (q.type === 'inline') {
                for (const c of q.content ?? []) {
                    if (c.questionId != null) out.push(c);
                }
            } else if (q.questionId != null) {
                out.push(q);
            }
        }
    }
    return out;
}

function hasRole(question, role) {
    const roles = question.displayRole;
    if (!roles) return false;
    return Array.isArray(roles) ? roles.includes(role) : roles === role;
}

const STATUSES = [
    'Awaiting Review',
    'Awaiting Review',
    'Awaiting Review',
    'Accepted',
    'Declined',
    'Wait List',
    'Accepted - RSVP to Confirm',
];

const SCHOOLS = [
    'Simon Fraser University',
    'University of British Columbia',
    'University of Victoria',
    'British Columbia Institute of Technology',
    'Douglas College',
    'Langara College',
    'Capilano University',
    'Kwantlen Polytechnic University',
    'University of Waterloo',
    'University of Toronto',
];

const SHORT_ANSWERS = {
    14: [
        'I love building things with friends over a weekend and meeting other students who care about tech.',
        'The chance to learn new frameworks and ship something real in 24 hours.',
        'StormHacks has a great community — I went last year and want to come back.',
        'I want to push myself outside my comfort zone and try hardware for the first time.',
    ],
    15: [
        'I want to get better at full-stack development and learn how to scope a project under time pressure.',
        'Hoping to explore climate tech and meet mentors in that space.',
        'I want to improve my teamwork skills and practice presenting a demo.',
        'Looking to learn more about ML and apply it to a real problem.',
    ],
    16: [
        'A campus navigation app that helps new students find study spaces using live occupancy data.',
        'An accessibility tool that auto-generates alt text for event photos in real time.',
        'A peer tutoring platform that matches students by course and learning style.',
        'A small hardware project that monitors indoor air quality in shared dorms.',
    ],
};

const TEAM_NAMES = [
    'Binary Brew',
    'Null Pointers',
    'Ctrl Alt Defeat',
    'Git Pushers',
    'Stack Overflow',
    'Runtime Errors',
    'Pixel Pioneers',
    'Cloud Nine',
    'Hack Street Boys',
    'Semicolon Squad',
];

function pickPendingStatus(currentStatus) {
    if (currentStatus === 'Accepted') return 'N/A';
    return faker.helpers.arrayElement(['N/A', 'Accepted', 'Declined']);
}

function pickChoice(question) {
    const choices = question.choices ?? [];
    if (!choices.length) return '';
    const choice = faker.helpers.arrayElement(choices);
    return choice.data ?? choice.name ?? '';
}

function pickChoices(question, count = 1) {
    const choices = question.choices ?? [];
    if (!choices.length) return question.allowMultiple ? [] : '';
    if (question.allowMultiple) {
        return faker.helpers
            .arrayElements(choices, faker.number.int({ min: 1, max: count }))
            .map((c) => c.data ?? c.name);
    }
    const choice = faker.helpers.arrayElement(choices);
    return choice.data ?? choice.name ?? '';
}

function buildPerson(i) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const slug = `${firstName}.${lastName}`
        .toLowerCase()
        .replace(/[^a-z.]/g, '');
    const email = `${slug}.seed${i}@example.com`;
    const schoolEmail = `${slug.slice(0, 8)}@${faker.helpers.arrayElement(['sfu.ca', 'student.ubc.ca', 'uvic.ca'])}`;

    return {
        firstName,
        lastName,
        email,
        schoolEmail,
        phone: faker.phone
            .number({ style: 'national' })
            .replace(/\D/g, '')
            .slice(0, 10),
        school: faker.helpers.arrayElement(SCHOOLS),
        country: faker.helpers.arrayElement([
            'Canada',
            'United States',
            'India',
            'China',
        ]),
        discord: `${firstName.toLowerCase()}${faker.number.int({ min: 100, max: 9999 })}`,
        linkedin: `https://linkedin.com/in/${slug.replace(/\./g, '-')}`,
        portfolio: `https://${slug.replace(/\./g, '')}.dev`,
    };
}

function buildResponse(questions, person) {
    const response = {};

    for (const q of questions) {
        const id = String(q.questionId);

        switch (q.type) {
            case 'text-line':
                if (hasRole(q, 'firstName')) response[id] = person.firstName;
                else if (hasRole(q, 'lastName')) response[id] = person.lastName;
                else if (hasRole(q, 'email')) response[id] = person.email;
                else if (q.title?.toLowerCase().includes('school email'))
                    response[id] = person.schoolEmail;
                else response[id] = faker.lorem.words(2);
                break;
            case 'phone':
                response[id] = person.phone;
                break;
            case 'api-dropdown':
                if (hasRole(q, 'school')) response[id] = person.school;
                else if (hasRole(q, 'country')) response[id] = person.country;
                else response[id] = faker.helpers.arrayElement(SCHOOLS);
                break;
            case 'dropdown':
                response[id] = pickChoice(q);
                break;
            case 'multiple-choice':
                response[id] = pickChoices(q);
                break;
            case 'multiple-checkbox':
                response[id] = pickChoices(q, 2);
                break;
            case 'text-area':
                response[id] = faker.helpers.arrayElement(
                    SHORT_ANSWERS[q.questionId] ?? [faker.lorem.paragraph()]
                );
                break;
            case 'number':
                response[id] = faker.number.int({ min: 0, max: 8 });
                break;
            case 'checkbox':
                response[id] = true;
                break;
            case 'file-upload':
                response[id] = [];
                break;
            case 'link':
                if (q.title?.toLowerCase().includes('linkedin'))
                    response[id] = person.linkedin;
                else if (q.title?.toLowerCase().includes('portfolio'))
                    response[id] = person.portfolio;
                else response[id] = '';
                break;
            case 'major':
                response[id] = [];
                break;
            default:
                response[id] = '';
        }
    }

    return response;
}

/** Plan solo applicants and teams so everyone on a team shares one status. */
function planApplicantGroups(total) {
    const groups = [];
    let personIndex = 0;
    let teamIndex = 0;
    let remaining = total;

    while (remaining > 0) {
        const canFormTeam =
            teamIndex < TEAM_NAMES.length &&
            remaining >= 2 &&
            faker.number.int({ min: 0, max: 1 }) === 1;

        if (canFormTeam) {
            const maxSize = Math.min(4, remaining);
            const minSize = remaining <= 4 ? remaining : 2;
            const teamSize = faker.number.int({ min: minSize, max: maxSize });
            const status = STATUSES[teamIndex % STATUSES.length];
            const pendingStatus = pickPendingStatus(status);
            const members = Array.from({ length: teamSize }, () =>
                buildPerson(personIndex++)
            );

            groups.push({
                teamName: TEAM_NAMES[teamIndex++],
                members,
                status,
                pendingStatus,
            });
            remaining -= teamSize;
            continue;
        }

        const status = STATUSES[personIndex % STATUSES.length];
        groups.push({
            teamName: null,
            members: [buildPerson(personIndex++)],
            status,
            pendingStatus: pickPendingStatus(status),
        });
        remaining -= 1;
    }

    return groups;
}

const [hack] = requestedHackId
    ? await sql`select id, name, questions from hackathons where id = ${requestedHackId}`
    : await sql`
        select id, name, questions from hackathons
        where is_active = true
        order by id desc
        limit 1`;

if (!hack) {
    console.error(
        requestedHackId
            ? `No hackathon with id ${requestedHackId}.`
            : 'No active hackathon found. Pass a hackathon id as the second argument.'
    );
    await sql.end();
    process.exit(1);
}

const questions = flattenQuestions(hack.questions);
if (!questions.length) {
    console.error(
        `Hackathon ${hack.id} (${hack.name}) has no application questions configured.`
    );
    await sql.end();
    process.exit(1);
}

const groups = planApplicantGroups(N);
const [{ maxId }] =
    await sql`select coalesce(max(id), 0)::int as "maxId" from "user"`;
let nextUserIndex = maxId;

let createdApplications = 0;
let createdTeams = 0;
let applicationOffset = 0;

for (const group of groups) {
    const groupUserIds = [];

    for (const person of group.members) {
        nextUserIndex += 1;
        const displayId = getSixDigitId(nextUserIndex, userRNGParams);

        const [user] = await sql`
            insert into "user" (first_name, last_name, email, display_id, "emailVerified")
            values (${person.firstName}, ${person.lastName}, ${person.email}, ${displayId}, true)
            on conflict (email) do nothing
            returning id
        `;

        if (!user) {
            console.warn(`Skipped duplicate email ${person.email}`);
            continue;
        }

        const response = buildResponse(questions, person);
        const createdAt = new Date(
            Date.now() - applicationOffset * 3 * 60 * 60 * 1000
        );
        applicationOffset += 1;

        const [application] = await sql`
            insert into applications (
                hackathon_id, user_id, response, current_status, pending_status, created_date
            ) values (
                ${hack.id},
                ${user.id},
                ${sql.json(response)},
                ${group.status},
                ${group.pendingStatus},
                ${createdAt}
            )
            on conflict (hackathon_id, user_id) do nothing
            returning user_id
        `;

        if (application) {
            createdApplications += 1;
            groupUserIds.push(user.id);
        }
    }

    if (group.teamName && groupUserIds.length >= 2) {
        const leaderId = groupUserIds[0];
        const [{ nextTeamId }] =
            await sql`select coalesce(max(id), 0)::int + 1 as "nextTeamId" from teams`;
        const teamDisplayId = getSixDigitId(nextTeamId, teamRNGParams);

        const [team] = await sql`
            insert into teams (hackathon_id, name, created_by, display_id)
            values (${hack.id}, ${group.teamName}, ${leaderId}, ${teamDisplayId})
            returning id
        `;

        for (const userId of groupUserIds) {
            await sql`
                insert into memberships (team_id, user_id)
                values (${team.id}, ${userId})
                on conflict do nothing
            `;
        }

        createdTeams += 1;
    }
}

console.log(
    `Seeded ${createdApplications} applications for hackathon ${hack.id} (${hack.name}).`
);
console.log(`Created ${createdTeams} teams (members share status per team).`);
await sql.end();
