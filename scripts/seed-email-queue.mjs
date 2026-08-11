// Usage: node --env-file=.env scripts/seed-email-queue.mjs [count] [hackathonId]
import postgres from 'postgres';

const sql = postgres(process.env.DBURL, { max: 1 });
const MAX_RETRIES = parseInt(process.env.EMAIL_MAX_RETRIES ?? '3', 10);
const N = parseInt(process.argv[2] ?? '30', 10);
const requestedHackId = process.argv[3] ? parseInt(process.argv[3], 10) : null;

const [hack] = requestedHackId
    ? await sql`select id, name from hackathons where id = ${requestedHackId}`
    : await sql`
        select h.id, h.name from hackathons h
        join email_templates t on t.hackathon_id = h.id
        group by h.id, h.name order by h.id limit 1`;

if (!hack) {
    console.error(
        requestedHackId
            ? `No hackathon with id ${requestedHackId}.`
            : 'No hackathon has any email templates. Create one on the admin email templates page first.'
    );
    await sql.end();
    process.exit(1);
}

const hackId = hack.id;

const templates =
    await sql`select id from email_templates where hackathon_id = ${hackId} order by id`;
const templateIds = templates.map((t) => t.id);

if (templateIds.length === 0) {
    console.error(
        `Hackathon ${hackId} (${hack.name}) has no email templates, so seeded rows could never send.`
    );
    await sql.end();
    process.exit(1);
}

const pickTemplate = (i) => templateIds[i % templateIds.length];

const users = await sql`select id from "user" order by id limit 5`;
const userIds = users.map((u) => u.id);

if (userIds.length === 0) {
    console.error('No users in the database to attach queue rows to.');
    await sql.end();
    process.exit(1);
}

const pickUser = (i) => userIds[i % userIds.length];

const types = [
    'hacker_accepted',
    'hacker_declined',
    'hacker_waitlisted',
    'rsvp_received',
    'custom',
    'reminder',
];
const statuses = ['pending', 'sent', 'failed'];

const rows = [];
for (let i = 0; i < N; i++) {
    const status = statuses[i % statuses.length];
    const created = new Date(Date.now() - i * 60 * 60 * 1000);
    rows.push({
        user_id: pickUser(i),
        template_id: pickTemplate(i),
        email: `test${i}@example.com`,
        first_name: `Test${i}`,
        last_name: 'User',
        hackathon_id: hackId,
        email_type: types[i % types.length],
        status,
        error_message:
            status === 'failed' ? 'SMTP connection timeout (seeded)' : null,
        failed_count: status === 'failed' ? MAX_RETRIES : 0,
        created_at: created,
        sent_at:
            status === 'sent'
                ? new Date(created.getTime() + 5 * 60 * 1000)
                : null,
    });
}

await sql`insert into email_queue ${sql(
    rows,
    'user_id',
    'template_id',
    'email',
    'first_name',
    'last_name',
    'hackathon_id',
    'email_type',
    'status',
    'error_message',
    'failed_count',
    'created_at',
    'sent_at'
)}`;

console.log(
    `Seeded ${N} email_queue rows for hackathon ${hackId} (${hack.name}) using templates ${templateIds.join(', ')}.`
);
await sql.end();
