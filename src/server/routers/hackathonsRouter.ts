import { InputFormPageData } from '@/components/application_components/types';
import { publicProcedure, router } from '../trpc';
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
import { validateApplicationQuestions } from '@/lib/applications/applicationQuestionsSchema';
import { getUserData } from '@/server/routers/usersRouter';
import { UserRoleEnum } from '@/db/schema/users/users';
import {
    BadRequestError,
    ResourceNotFoundError,
    UnauthorizedError,
} from '../exceptions';

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

async function assertAdmin() {
    const user = await getUserData();
    if (user?.userRole !== UserRoleEnum.admin) {
        throw new UnauthorizedError({
            email: user?.email,
            role: user?.userRole,
        });
    }
    return user;
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
    getHackathons: publicProcedure.query(async () => {
        return await databaseClient.select().from(hackathons);
    }),

    getActiveHackathon: publicProcedure.query(async () => {
        const { isActive, ...restOfHackathonColumns } =
            getTableColumns(hackathons);

        const [hackathon] = await databaseClient
            .select({
                ...restOfHackathonColumns,
            })
            .from(hackathons)
            .where(eq(hackathons.isActive, true))
            .limit(1)
            .orderBy(asc(hackathons.startDate));

        return hackathon ?? null;
    }),

    getVisibleHackathonsForNav: publicProcedure.query(async () => {
        return await databaseClient
            .select()
            .from(hackathons)
            .where(eq(hackathons.isVisible, true))
            .orderBy(asc(hackathons.startDate));
    }),

    /** Admin: list every hackathon (active or not) for the management table. */
    getHackathonsForAdmin: publicProcedure.query(async () => {
        await assertAdmin();
        return await databaseClient
            .select()
            .from(hackathons)
            .orderBy(asc(hackathons.startDate));
    }),

    getHackathonById: publicProcedure
        .input(z.object({ id: z.number().int() }))
        .query(async ({ input }) => {
            await assertAdmin();
            const [hackathon] = await databaseClient
                .select()
                .from(hackathons)
                .where(eq(hackathons.id, input.id))
                .limit(1);
            return hackathon ?? null;
        }),

    addHackathon: publicProcedure
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

    createHackathon: publicProcedure
        .input(createHackathonSchema)
        .mutation(async ({ input }) => {
            await assertAdmin();
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

    updateHackathon: publicProcedure
        .input(updateHackathonSchema)
        .mutation(async ({ input }) => {
            await assertAdmin();
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

    getApplicationQuestions: publicProcedure
        .input(z.object({ id: z.number().int() }))
        .query(async ({ input }) => {
            await assertAdmin();
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

    updateApplicationQuestions: publicProcedure
        .input(z.object({ id: z.number().int(), questions: z.unknown() }))
        .mutation(async ({ input }) => {
            await assertAdmin();

            const result = validateApplicationQuestions(input.questions);
            if (!result.ok) {
                throw new BadRequestError(
                    `Invalid application questions:\n- ${result.errors.join('\n- ')}`
                );
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

    getEventPagePayload: publicProcedure
        .input(z.object({ id: z.number().int() }))
        .query(async ({ input }) => {
            await assertAdmin();
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

    updateEventPagePayload: publicProcedure
        .input(
            z.object({ id: z.number().int(), payload: eventPagePayloadSchema })
        )
        .mutation(async ({ input }) => {
            await assertAdmin();

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

    deleteHackathon: publicProcedure
        .input(deleteHackathonSchema)
        .mutation(async (opts) => {
            await assertAdmin();
            await databaseClient
                .delete(hackathons)
                .where(eq(hackathons.id, opts.input.id));

            revalidateTag('active-hackathon', 'max');
        }),
});

export type HackathonsRouter = typeof hackathonsRouter;
