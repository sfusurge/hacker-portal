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
    applicationOpen: timestamp('application_open', {
        mode: 'date',
        withTimezone: true,
    }),
    applicationCloses: timestamp('application_closes', {
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

export {
    deleteHackathonSchema,
    hackathons,
    insertHackathonSchema,
    selectHackathonSchema,
};
