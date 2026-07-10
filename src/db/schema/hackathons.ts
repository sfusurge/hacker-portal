import {
    InputFormPageData,
    JudgeQuestion,
    JudgingFormQuestion,
    SubmissionJudgeRubric,
} from '@/components/application_components/types';
import {
    boolean,
    integer,
    jsonb,
    pgTable,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core';

import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/** `event_page_payload`: marketing / event-page copy and assets. */
export type HackathonEventPagePayload = {
    eventPageLabel: string;
    name: string;
    tagline: string;
    iconSrc: string;
    desktopBannerSrc?: string;
    mobileBannerSrc?: string;
    overview: string;
    location: string;
    dates: string;
    websiteLabel: string;
    websiteHref: string;
    recapHref: string | null;
    hackerPackageHref?: string | null;
    targetAudience?: string;
    acceptedDiscordInviteHref?: string | null;
};

// Journey hack submission deadline, February 13th, 2025 at 23:59:59
const JOURNEY_HACK_2025_DEADLINE = new Date(1_739_519_999 * 1_000);

const hackathons = pgTable('hackathons', {
    id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    startDate: varchar('start_date', { length: 255 }).notNull(),
    endDate: varchar('end_date', { length: 255 }).notNull(),
    submissionDeadline: timestamp('submission_deadline')
        .notNull()
        .default(JOURNEY_HACK_2025_DEADLINE),
    projectGalleryOpen: timestamp('project_gallery_open', {
        mode: 'date',
        withTimezone: true,
    }),
    submissionOpen: timestamp('submission_open', {
        mode: 'date',
        withTimezone: true,
    }),
    applicationQuestions: jsonb('questions')
        .$type<InputFormPageData[]>()
        .notNull()
        .default([]),
    version: integer('version').notNull().default(1),
    isActive: boolean('is_active').notNull().default(false),
    isVisible: boolean('is_visible').notNull().default(false),
    isMultipleLocations: boolean('is_multiple_locations')
        .notNull()
        .default(false),
    submissionQuestions: jsonb('submissionQuestions')
        .$type<InputFormPageData[]>()
        .notNull()
        .default([]),

    judgeQuestions: jsonb('judgeQuestions')
        .notNull()
        .default([])
        .$type<JudgingFormQuestion[]>(),
    judgeRubric: jsonb('judgeRubric')
        .notNull()
        .default([])
        .$type<SubmissionJudgeRubric[]>(),
    isPaid: boolean('is_paid').notNull().default(false),
    paymentDeadline: timestamp('payment_deadline', {
        mode: 'date',
        withTimezone: true,
    }),
    applicationOpen: timestamp('application_open', {
        mode: 'date',
        withTimezone: true,
    }),
    applicationCloses: timestamp('application_closes', {
        mode: 'date',
        withTimezone: true,
    }),
    audienceVotingEnabled: boolean('audience_voting_enabled')
        .notNull()
        .default(false),
    audienceVotingOpen: timestamp('audience_voting_open', {
        mode: 'date',
        withTimezone: true,
    }),
    audienceVotingCloses: timestamp('audience_voting_closes', {
        mode: 'date',
        withTimezone: true,
    }),
    eventPageSlug: varchar('event_page_slug', { length: 255 })
        .notNull()
        .default('stormhacks'),

    eventPagePayload: jsonb('event_page_payload')
        .$type<HackathonEventPagePayload | null>()
        .default(null),
});

const insertHackathonSchema = createInsertSchema(hackathons, {
    startDate: (startDate) => startDate.date(),
    endDate: (endDate) => endDate.date(),
});

const deleteHackathonSchema = z
    .object({
        id: z.number().gte(1),
    })
    .required();

const selectHackathonSchema = createSelectSchema(hackathons);

const hackathonConfigSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    eventPageSlug: z.string().min(1).max(255),

    submissionDeadline: z.number().int(),
    applicationOpen: z.number().int().nullable(),
    applicationCloses: z.number().int().nullable(),
    submissionOpen: z.number().int().nullable(),
    projectGalleryOpen: z.number().int().nullable(),
    paymentDeadline: z.number().int().nullable(),
    audienceVotingOpen: z.number().int().nullable(),
    audienceVotingCloses: z.number().int().nullable(),

    isActive: z.boolean(),
    isVisible: z.boolean(),
    isPaid: z.boolean(),
    isMultipleLocations: z.boolean(),
    audienceVotingEnabled: z.boolean(),
});

const eventPagePayloadSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    tagline: z.string().max(500).default(''),
    dates: z.string().max(255).default(''),
    location: z.string().max(255).default(''),
    overview: z.string().max(4000).default(''),
    targetAudience: z.string().max(255).default(''),
    eventPageLabel: z.string().max(255).default(''),
    iconSrc: z.string().max(2000).default(''),
    desktopBannerSrc: z.string().max(2000).default(''),
    mobileBannerSrc: z.string().max(2000).default(''),
    websiteLabel: z.string().max(255).default(''),
    websiteHref: z.string().max(2000).default(''),
    recapHref: z.string().max(2000).default(''),
    hackerPackageHref: z.string().max(2000).default(''),
    acceptedDiscordInviteHref: z.string().max(2000).default(''),
});

type EventPagePayloadInput = z.infer<typeof eventPagePayloadSchema>;

const createHackathonSchema = hackathonConfigSchema.extend({
    /** Optional content saved together with the new hackathon. */
    eventPagePayload: eventPagePayloadSchema.optional(),
    applicationQuestions: z.array(z.unknown()).optional(),
});

const updateHackathonSchema = hackathonConfigSchema.extend({
    id: z.number().int(),
});

type HackathonConfigInput = z.infer<typeof hackathonConfigSchema>;

export {
    createHackathonSchema,
    deleteHackathonSchema,
    eventPagePayloadSchema,
    hackathonConfigSchema,
    hackathons,
    insertHackathonSchema,
    selectHackathonSchema,
    updateHackathonSchema,
};
export type { EventPagePayloadInput, HackathonConfigInput };
