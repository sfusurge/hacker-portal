import { sql } from 'drizzle-orm';
import {
    pgTable,
    text,
    timestamp,
    integer,
    varchar,
    jsonb,
    uuid,
} from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

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

export type EmailAttachment = {
    key: string;
    fileName: string;
    cropData?: {
        x: number;
        y: number;
        width: number;
        height: number;
        originalWidth: number;
        originalHeight: number;
    };
};

export const emailTemplates = pgTable('email_templates', {
    id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
    title: varchar('title', { length: 256 }).notNull(),
    purpose: varchar('purpose', { length: 256 }).notNull(),
    description: text('description'),
    content: text('content').notNull(),
    attachments: jsonb('attachments'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const emails = pgTable('sh_25_emails', {
    id: uuid('id')
        .default(sql`uuid_generate_v4()`)
        .primaryKey(),
    email: varchar('email', { length: 256 }).notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export const emailTemplateSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    purpose: z.string().min(1, 'Purpose is required'),
    description: z.string().optional(),
    content: z.string().min(1, 'Email content is required'),
    attachments: z
        .array(
            z.object({
                key: z.string(),
                fileName: z.string(),
                cropData: z
                    .object({
                        x: z.number(),
                        y: z.number(),
                        width: z.number(),
                        height: z.number(),
                        originalWidth: z.number(),
                        originalHeight: z.number(),
                    })
                    .optional(),
            })
        )
        .optional(),
});

export const selectEmailTemplateSchema = createSelectSchema(emailTemplates);
export const emailTemplateIdSchema = selectEmailTemplateSchema.pick({
    id: true,
});

export type EmailTemplate = z.infer<typeof selectEmailTemplateSchema>;
export type NewEmailTemplate = z.infer<typeof emailTemplateSchema>;

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
    createdAt: timestamp('created_at').notNull().defaultNow(),
    sentAt: timestamp('sent_at'),
});
