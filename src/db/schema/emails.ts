import { sql } from 'drizzle-orm';
import {
    pgTable,
    pgEnum,
    text,
    timestamp,
    integer,
    varchar,
    uuid,
} from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { hackathons } from '@/db/schema/hackathons';

export const sendEmailSchema = z.object({
    templateId: z.number(),
    user: z.object({
        id: z.number(),
        email: z.string().email(),
        name: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
    }),
    attachments: z
        .array(
            z.object({
                key: z.string(),
                fileName: z.string(),
            })
        )
        .optional(),
});

export type EmailUser = {
    id: number;
    email: string;
    name: string;
};

/**
 * Reusable HTML wrapper (doctype, head, styles, body shell).
 * Use {{bodyContent}} in html where the email body should be injected.
 */
export const emailTemplateStyling = pgTable('email_template_styling', {
    id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    html: text('html').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Type of hackathon-related email. Used to categorize templates per hackathon.
 */
export const hackathonEmailTypeEnum = pgEnum('hackathon_email_type', [
    'hacker_applied',
    'rsvp_received',
    'hacker_declined',
    'hacker_accepted',
    'hacker_waitlisted',
    'custom',
]);

export type HackathonEmailType =
    (typeof hackathonEmailTypeEnum.enumValues)[number];

/** Human-readable labels for email types (for UI). */
export const HACKATHON_EMAIL_TYPE_LABELS: Record<HackathonEmailType, string> = {
    hacker_applied: 'Hacker applied',
    rsvp_received: 'RSVP received',
    hacker_declined: 'Hacker declined',
    hacker_accepted: 'Hacker accepted',
    hacker_waitlisted: 'Hacker waitlisted',
    custom: 'Custom',
};

export const emailTemplates = pgTable('email_templates', {
    id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
    title: varchar('title', { length: 256 }).notNull(),
    purpose: varchar('purpose', { length: 256 }).notNull(),
    description: text('description'),
    stylingId: integer('styling_id').references(() => emailTemplateStyling.id, {
        onDelete: 'set null',
    }),
    content: text('content').notNull(),
    hackathonId: integer('hackathon_id')
        .references(() => hackathons.id, {
            onDelete: 'restrict',
        })
        .notNull(),
    emailType: hackathonEmailTypeEnum('email_type'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const emails = pgTable('sh_25_emails', {
    id: uuid('id')
        .default(sql`gen_random_uuid()`)
        .primaryKey(),
    email: varchar('email', { length: 256 }).notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .notNull()
        .defaultNow(),
});

/** Placeholder in styling HTML where body content is injected. */
export const EMAIL_STYLING_BODY_PLACEHOLDER = '{{bodyContent}}';

export const emailTemplateStylingSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    html: z.string().min(1, 'Styling HTML is required'),
});

export const emailTemplateSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    purpose: z.string().min(1, 'Purpose is required'),
    description: z.string().optional(),
    stylingId: z.number().int().nullable().optional(),
    content: z.string().min(1, 'Email content is required'),
    hackathonId: z.number().int(),
    emailType: z.enum(hackathonEmailTypeEnum.enumValues).nullable().optional(),
});

export const selectEmailTemplateSchema = createSelectSchema(emailTemplates);
export const emailTemplateIdSchema = selectEmailTemplateSchema.pick({
    id: true,
});

export type EmailTemplate = z.infer<typeof selectEmailTemplateSchema>;
export type NewEmailTemplate = z.infer<typeof emailTemplateSchema>;
export type EmailTemplateStyling = typeof emailTemplateStyling.$inferSelect;
export type NewEmailTemplateStyling = typeof emailTemplateStyling.$inferInsert;

export const getEmailTemplateSchema = z.object({
    id: z.number().int(),
});

export const deleteEmailTemplateSchema = z.object({
    id: z.number().int(),
});

export const emailQueue = pgTable('email_queue', {
    id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
    userId: integer('user_id').notNull(),
    templateId: integer('template_id').notNull(),
    email: varchar('email', { length: 256 }).notNull(),
    firstName: varchar('first_name', { length: 256 }),
    lastName: varchar('last_name', { length: 256 }),
    hackathonId: integer('hackathon_id'),
    emailType: varchar('email_type', { length: 256 }),
    status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending', 'sent', 'failed'
    errorMessage: text('error_message'),
    failedCount: integer('failed_count').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    sentAt: timestamp('sent_at'),
});
