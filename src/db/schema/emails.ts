import {
    pgTable,
    text,
    timestamp,
    integer,
    varchar,
} from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const sendEmailSchema = z.object({
    templateId: z.number(),
    user: z.object({
        id: z.number(),
        email: z.string().email(),
        name: z.string(),
    }),
});

export type EmailUser = {
    id: number;
    email: string;
    name: string;
};

export const emailTemplates = pgTable('email_templates', {
    id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
    title: varchar('title', { length: 256 }).notNull(),
    purpose: varchar('purpose', { length: 256 }).notNull(),
    description: text('description'),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const emailTemplateSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    purpose: z.string().min(1, 'Purpose is required'),
    description: z.string().optional(),
    content: z.string().min(1, 'Email content is required'),
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
