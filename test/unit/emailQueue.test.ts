import { createCaller } from '@/server/appRouter';
import { databaseClient } from '@/db/client';
import { emailQueue, emailTemplates } from '@/db/schema/emails';
import { getUserData } from '@/server/routers/usersRouter';
import {
    TEST_HACKATHON_NAME,
    TEST_HACKATHON_START_DATE,
    TEST_HACKATHON_END_DATE,
} from '../utils';

// revalidateTag() has no static-generation store outside a request, so stub it.
vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }));

// The admin gate calls getUserData() from usersRouter (which reads the session).
vi.mock('@/server/routers/usersRouter', async (importOriginal) => {
    const actual =
        await importOriginal<typeof import('@/server/routers/usersRouter')>();
    return { ...actual, getUserData: vi.fn() };
});

// Capture sends instead of hitting SMTP.
const { transportMock } = vi.hoisted(() => ({
    transportMock: { sendMail: vi.fn() },
}));
vi.mock('@/server/nodemailerTransporter', () => ({
    transporter: transportMock,
}));

const asRole = (userRole: string) =>
    vi.mocked(getUserData).mockResolvedValue({
        id: 1,
        email: 'admin@sfusurge.com',
        userRole,
    } as Awaited<ReturnType<typeof getUserData>>);

function row(overrides: Record<string, unknown> = {}) {
    return {
        userId: 1,
        templateId: 1,
        email: 'x@example.com',
        firstName: 'X',
        lastName: 'Y',
        hackathonId: null,
        emailType: 'custom',
        status: 'pending',
        errorMessage: null,
        failedCount: 0,
        ...overrides,
    };
}

const seed = (rows: Record<string, unknown>[]) =>
    databaseClient.insert(emailQueue).values(rows as never);

describe('emailQueue router', () => {
    const trpc = createCaller({});

    beforeEach(() => {
        vi.mocked(getUserData).mockReset();
        asRole('admin');
        transportMock.sendMail.mockReset();
        transportMock.sendMail.mockImplementation(
            (_opts: unknown, cb: (e: unknown, i: unknown) => void) =>
                cb(null, { response: 'ok' })
        );
    });

    it('blocks non-admins', async () => {
        asRole('user');
        await expect(trpc.emailQueue.getQueueStatus({})).rejects.toThrow();
    });

    it('counts by status', async () => {
        await seed([
            row(),
            row(),
            row({ status: 'sent' }),
            row({ status: 'failed' }),
        ]);
        const s = await trpc.emailQueue.getQueueStatus({});
        expect(s).toMatchObject({ pending: 2, sent: 1, failed: 1, total: 4 });
    });

    it('breaks down by email type + template', async () => {
        await seed([
            row({ emailType: 'custom' }),
            row({ emailType: 'custom', status: 'sent' }),
            row({ emailType: 'reminder' }),
        ]);
        const breakdown = await trpc.emailQueue.getQueueBreakdown({});
        const custom = breakdown.find((r) => r.emailType === 'custom');
        expect(custom).toMatchObject({ total: 2, pending: 1, sent: 1 });
    });

    it('paginates with a cursor', async () => {
        await seed(
            Array.from({ length: 5 }, (_, i) => row({ email: `u${i}@x.com` }))
        );
        const p1 = await trpc.emailQueue.getQueueItems({ limit: 2 });
        expect(p1.items).toHaveLength(2);
        expect(p1.nextToken).toBeDefined();
        const p2 = await trpc.emailQueue.getQueueItems({
            limit: 2,
            cursor: p1.nextToken,
        });
        expect(p2.items).toHaveLength(2);
        expect(p2.items[0].id).not.toBe(p1.items[0].id);
    });

    // These rows all share a createdAt, so without an id tiebreaker the page
    // boundary can repeat or drop rows.
    it('walks every row exactly once when createdAt is identical', async () => {
        await seed(
            Array.from({ length: 5 }, (_, i) => row({ email: `u${i}@x.com` }))
        );

        const seen: number[] = [];
        let cursor: string | undefined;
        do {
            const page = await trpc.emailQueue.getQueueItems({
                limit: 2,
                cursor,
            });
            seen.push(...page.items.map((i) => i.id));
            cursor = page.nextToken;
        } while (cursor);

        expect(seen).toHaveLength(5);
        expect(new Set(seen).size).toBe(5);
    });

    it('filters by sent date range', async () => {
        const jan = new Date('2026-01-15T12:00:00Z');
        const jun = new Date('2026-06-15T12:00:00Z');
        await seed([
            row({ email: 'jan@x.com', status: 'sent', sentAt: jan }),
            row({ email: 'jun@x.com', status: 'sent', sentAt: jun }),
        ]);

        const r = await trpc.emailQueue.getQueueItems({
            sentFrom: '2026-06-01T00:00:00',
            sentTo: '2026-06-30T23:59:59',
        });

        expect(r.items).toHaveLength(1);
        expect(r.items[0].email).toBe('jun@x.com');
    });

    it('filters by search term', async () => {
        await seed([
            row({ email: 'alice@x.com', firstName: 'Alice' }),
            row({ email: 'bob@x.com', firstName: 'Bob' }),
        ]);
        const r = await trpc.emailQueue.getQueueItems({ search: 'alice' });
        expect(r.items).toHaveLength(1);
        expect(r.items[0].email).toBe('alice@x.com');
    });

    it('retryFailed resets a failed row to pending', async () => {
        await seed([
            row({ status: 'failed', errorMessage: 'boom', failedCount: 3 }),
        ]);
        const [failed] = await databaseClient.select().from(emailQueue);
        const res = await trpc.emailQueue.retryFailed({ ids: [failed.id] });
        expect(res.retried).toBe(1);
        const [after] = await databaseClient.select().from(emailQueue);
        expect(after.status).toBe('pending');
        expect(after.failedCount).toBe(0);
        expect(after.errorMessage).toBeNull();
    });

    it('processQueueNow sends pending rows via the (mocked) transport', async () => {
        const hack = await trpc.hackathons.addHackathon({
            name: TEST_HACKATHON_NAME,
            startDate: TEST_HACKATHON_START_DATE,
            endDate: TEST_HACKATHON_END_DATE,
        });
        const [tpl] = await databaseClient
            .insert(emailTemplates)
            .values({
                title: 'Hi',
                purpose: 'greeting',
                content: 'Hello {{firstName}}',
                hackathonId: hack.id,
            })
            .returning();
        await seed([
            row({
                templateId: tpl.id,
                hackathonId: hack.id,
                status: 'pending',
            }),
        ]);

        const res = await trpc.emailQueue.processQueueNow({
            hackathonId: hack.id,
        });

        expect(transportMock.sendMail).toHaveBeenCalledTimes(1);
        expect(res.sent).toBe(1);
        const [after] = await databaseClient.select().from(emailQueue);
        expect(after.status).toBe('sent');
    });
});
