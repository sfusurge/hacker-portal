import { InputFormPageData } from '@/components/application_components/types';
import {
    adminOrSponsorProcedure,
    adminProcedure,
    ownerProcedure,
    publicProcedure,
    router,
} from '../trpc';
import { databaseClient } from '@/db/client';
import {
    createHackathonSchema,
    deleteHackathonSchema,
    eventPagePayloadSchema,
    hackathons,
    insertHackathonSchema,
    updateHackathonSchema,
    type HackathonConfigInput,
} from '@/db/schema/hackathons';
import type { HackathonEventPagePayload } from '@/db/schema/hackathons';
import { and, asc, eq, getTableColumns, ne } from 'drizzle-orm';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { pacificInputToOffsetString } from '@/lib/datetime/pacific';
import {
    getQuestionIds,
    validateApplicationQuestions,
} from '@/lib/applications/applicationQuestionsSchema';
import { applications } from '@/db/schema/applications';
import { BadRequestError, ResourceNotFoundError } from '../exceptions';
import { company } from '@/db/schema/company';

async function assertSlugAvailable(slug: string, exceptId?: number) {
    const [conflict] = await databaseClient
        .select({ id: hackathons.id })
        .from(hackathons)
        .where(
            exceptId == null
                ? eq(hackathons.eventPageSlug, slug)
                : and(
                      eq(hackathons.eventPageSlug, slug),
                      ne(hackathons.id, exceptId)
                  )
        )
        .limit(1);

    if (conflict) {
        throw new BadRequestError(
            `Event page slug "${slug}" is already used by another hackathon.`
        );
    }
}

function hasMeaningfulValue(value: unknown): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (Array.isArray(value)) return value.length > 0;
    return true;
}

async function findOrphanedResponses(
    hackathonId: number,
    keptQuestionIds: Set<number>
) {
    const [current] = await databaseClient
        .select({ questions: hackathons.applicationQuestions })
        .from(hackathons)
        .where(eq(hackathons.id, hackathonId))
        .limit(1);

    const previousIds = getQuestionIds(
        (current?.questions ?? []) as InputFormPageData[]
    );
    const removedIds = new Set(
        previousIds.filter((id) => !keptQuestionIds.has(id))
    );

    if (removedIds.size === 0) {
        return { orphanIds: [] as number[], affectedApplications: 0 };
    }

    const rows = await databaseClient
        .select({ response: applications.response })
        .from(applications)
        .where(eq(applications.hackathonId, hackathonId));

    const orphanIds = new Set<number>();
    let affectedApplications = 0;

    for (const row of rows) {
        const response = (row.response ?? {}) as Record<string, unknown>;
        let affected = false;
        for (const [key, value] of Object.entries(response)) {
            const questionId = Number(key);
            if (!Number.isInteger(questionId)) continue;
            if (!hasMeaningfulValue(value)) continue;
            if (removedIds.has(questionId)) {
                orphanIds.add(questionId);
                affected = true;
            }
        }
        if (affected) affectedApplications++;
    }

    return {
        orphanIds: [...orphanIds].sort((a, b) => a - b),
        affectedApplications,
    };
}

function toHackathonColumns(input: HackathonConfigInput) {
    const toDate = (ms: number | null) => (ms == null ? null : new Date(ms));
    return {
        name: input.name,
        startDate: pacificInputToOffsetString(input.startDate),
        endDate: pacificInputToOffsetString(input.endDate),
        eventPageSlug: input.eventPageSlug,
        submissionDeadline: new Date(input.submissionDeadline),
        applicationOpen: toDate(input.applicationOpen),
        applicationCloses: toDate(input.applicationCloses),
        submissionOpen: toDate(input.submissionOpen),
        projectGalleryOpen: toDate(input.projectGalleryOpen),
        paymentDeadline: toDate(input.paymentDeadline),
        audienceVotingOpen: toDate(input.audienceVotingOpen),
        audienceVotingCloses: toDate(input.audienceVotingCloses),
        isActive: input.isActive,
        isVisible: input.isVisible,
        isPaid: input.isPaid,
        isMultipleLocations: input.isMultipleLocations,
        audienceVotingEnabled: input.audienceVotingEnabled,
    };
}

export const hackathonsRouter = router({
    getHackathons: adminProcedure.query(async () => {
        return await databaseClient.select().from(hackathons);
    }),

    getSponsorHackathons: adminOrSponsorProcedure.query(async ({ ctx }) => {
        if (ctx.user.userRole === 'admin' || ctx.user.userRole === 'owner') {
            return databaseClient
                .select({
                    id: hackathons.id,
                    name: hackathons.name,
                    startDate: hackathons.startDate,
                })
                .from(hackathons)
                .orderBy(asc(hackathons.startDate));
        }

        return databaseClient
            .select({
                id: hackathons.id,
                name: hackathons.name,
                startDate: hackathons.startDate,
            })
            .from(hackathons)
            .innerJoin(
                company,
                and(
                    eq(company.hackathonId, hackathons.id),
                    eq(company.userId, ctx.user.id),
                    eq(company.portalRole, 'sponsor')
                )
            )
            .orderBy(asc(hackathons.startDate));
    }),

    getActiveHackathon: publicProcedure.query(async () => {
        const {
            isActive,
            judgeQuestions,
            judgeRubric,
            ...publicHackathonColumns
        } = getTableColumns(hackathons);
        void isActive;
        void judgeQuestions;
        void judgeRubric;

        const [hackathon] = await databaseClient
            .select({
                ...publicHackathonColumns,
            })
            .from(hackathons)
            .where(eq(hackathons.isActive, true))
            .limit(1)
            .orderBy(asc(hackathons.startDate));

        return hackathon ?? null;
    }),

    getVisibleHackathonsForNav: publicProcedure.query(async () => {
        return await databaseClient
            .select({
                name: hackathons.name,
                startDate: hackathons.startDate,
                eventPageSlug: hackathons.eventPageSlug,
                eventPagePayload: hackathons.eventPagePayload,
            })
            .from(hackathons)
            .where(eq(hackathons.isVisible, true))
            .orderBy(asc(hackathons.startDate));
    }),

    /** Admin: list every hackathon (active or not) for the management table. */
    getHackathonsForAdmin: ownerProcedure.query(async () => {
        return await databaseClient
            .select()
            .from(hackathons)
            .orderBy(asc(hackathons.startDate));
    }),

    getHackathonById: ownerProcedure
        .input(z.object({ id: z.number().int() }))
        .query(async ({ input }) => {
            const [hackathon] = await databaseClient
                .select()
                .from(hackathons)
                .where(eq(hackathons.id, input.id))
                .limit(1);
            return hackathon ?? null;
        }),

    addHackathon: ownerProcedure
        .input(insertHackathonSchema)
        .mutation(async ({ input }) => {
            const [hackathon] = await databaseClient
                .insert(hackathons)
                .values({
                    name: input.name,
                    startDate: input.startDate,
                    endDate: input.endDate,
                    isActive: input.isActive,
                    applicationQuestions:
                        input.applicationQuestions as InputFormPageData[],
                    version: input.version,
                })
                .returning();

            revalidateTag('active-hackathon', 'max');
            return hackathon;
        }),

    createHackathon: ownerProcedure
        .input(createHackathonSchema)
        .mutation(async ({ input }) => {
            const values = toHackathonColumns(input);
            await assertSlugAvailable(values.eventPageSlug);

            const content: Record<string, unknown> = {};
            if (input.applicationQuestions != null) {
                const result = validateApplicationQuestions(
                    input.applicationQuestions
                );
                if (!result.ok) {
                    throw new BadRequestError(
                        `Invalid application questions:\n- ${result.errors.join('\n- ')}`
                    );
                }
                content.applicationQuestions = result.data;
            }
            if (input.eventPagePayload != null) {
                content.eventPagePayload =
                    input.eventPagePayload as HackathonEventPagePayload;
            }

            const created = await databaseClient.transaction(async (tx) => {
                if (values.isActive) {
                    await tx
                        .update(hackathons)
                        .set({ isActive: false })
                        .where(eq(hackathons.isActive, true));
                }
                const [row] = await tx
                    .insert(hackathons)
                    .values({ ...values, ...content })
                    .returning();
                return row;
            });

            revalidateTag('active-hackathon', 'max');
            return created;
        }),

    updateHackathon: ownerProcedure
        .input(updateHackathonSchema)
        .mutation(async ({ input }) => {
            const values = toHackathonColumns(input);
            await assertSlugAvailable(values.eventPageSlug, input.id);

            const updated = await databaseClient.transaction(async (tx) => {
                if (values.isActive) {
                    await tx
                        .update(hackathons)
                        .set({ isActive: false })
                        .where(
                            and(
                                eq(hackathons.isActive, true),
                                ne(hackathons.id, input.id)
                            )
                        );
                }
                const [row] = await tx
                    .update(hackathons)
                    .set(values)
                    .where(eq(hackathons.id, input.id))
                    .returning();
                return row;
            });

            if (!updated) {
                throw new ResourceNotFoundError({
                    id: input.id,
                    resourceType: 'hackathon',
                });
            }

            revalidateTag('active-hackathon', 'max');
            return updated;
        }),

    getApplicationQuestions: ownerProcedure
        .input(z.object({ id: z.number().int() }))
        .query(async ({ input }) => {
            const [row] = await databaseClient
                .select({
                    applicationQuestions: hackathons.applicationQuestions,
                })
                .from(hackathons)
                .where(eq(hackathons.id, input.id))
                .limit(1);
            if (!row) {
                throw new ResourceNotFoundError({
                    id: input.id,
                    resourceType: 'hackathon',
                });
            }
            return row.applicationQuestions;
        }),

    getApplicationResponseImpact: ownerProcedure
        .input(z.object({ id: z.number().int(), questions: z.unknown() }))
        .query(async ({ input }) => {
            const result = validateApplicationQuestions(input.questions);
            if (!result.ok) {
                return { orphanIds: [] as number[], affectedApplications: 0 };
            }

            const keptQuestionIds = new Set(getQuestionIds(result.data));
            return await findOrphanedResponses(input.id, keptQuestionIds);
        }),

    updateApplicationQuestions: ownerProcedure
        .input(
            z.object({
                id: z.number().int(),
                questions: z.unknown(),
                force: z.boolean().optional(),
            })
        )
        .mutation(async ({ input }) => {
            const result = validateApplicationQuestions(input.questions);
            if (!result.ok) {
                throw new BadRequestError(
                    `Invalid application questions:\n- ${result.errors.join('\n- ')}`
                );
            }

            if (!input.force) {
                const keptQuestionIds = new Set(getQuestionIds(result.data));
                const { orphanIds, affectedApplications } =
                    await findOrphanedResponses(input.id, keptQuestionIds);
                if (orphanIds.length > 0) {
                    throw new BadRequestError(
                        `This removes question(s) ${orphanIds.join(', ')} that ${affectedApplications} submitted application(s) already answered. Re-add them with the same ID, or confirm to save and leave those answers orphaned.`
                    );
                }
            }

            const [updated] = await databaseClient
                .update(hackathons)
                .set({
                    applicationQuestions: result.data as InputFormPageData[],
                })
                .where(eq(hackathons.id, input.id))
                .returning({ id: hackathons.id });

            if (!updated) {
                throw new ResourceNotFoundError({
                    id: input.id,
                    resourceType: 'hackathon',
                });
            }

            revalidateTag('active-hackathon', 'max');
            return { id: updated.id, pages: result.data.length };
        }),

    getEventPagePayload: ownerProcedure
        .input(z.object({ id: z.number().int() }))
        .query(async ({ input }) => {
            const [row] = await databaseClient
                .select({ eventPagePayload: hackathons.eventPagePayload })
                .from(hackathons)
                .where(eq(hackathons.id, input.id))
                .limit(1);
            if (!row) {
                throw new ResourceNotFoundError({
                    id: input.id,
                    resourceType: 'hackathon',
                });
            }
            return row.eventPagePayload;
        }),

    updateEventPagePayload: ownerProcedure
        .input(
            z.object({ id: z.number().int(), payload: eventPagePayloadSchema })
        )
        .mutation(async ({ input }) => {
            const [updated] = await databaseClient
                .update(hackathons)
                .set({
                    eventPagePayload:
                        input.payload as HackathonEventPagePayload,
                })
                .where(eq(hackathons.id, input.id))
                .returning({ id: hackathons.id });

            if (!updated) {
                throw new ResourceNotFoundError({
                    id: input.id,
                    resourceType: 'hackathon',
                });
            }

            revalidateTag('active-hackathon', 'max');
            return { id: updated.id };
        }),

    deleteHackathon: ownerProcedure
        .input(deleteHackathonSchema)
        .mutation(async (opts) => {
            const [target] = await databaseClient
                .select({ isActive: hackathons.isActive })
                .from(hackathons)
                .where(eq(hackathons.id, opts.input.id))
                .limit(1);
            if (target?.isActive) {
                throw new BadRequestError(
                    'Deactivate this hackathon before deleting it.'
                );
            }

            await databaseClient
                .delete(hackathons)
                .where(eq(hackathons.id, opts.input.id));

            revalidateTag('active-hackathon', 'max');
        }),
});

export type HackathonsRouter = typeof hackathonsRouter;
