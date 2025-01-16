import {
  integer,
  json,
  pgTable,
  primaryKey,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { hackathons } from './hackathons';
import { users } from './users';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const applications = pgTable(
  'applications',
  {
    hackathonId: integer('hackathon_id')
      .references(() => hackathons.id)
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id)
      .notNull(),
    response: json().notNull(),
    createdDate: varchar('created_date', { length: 255 }).notNull(),
    updatedDate: varchar('updated_date', { length: 255 }).notNull(),
  },
  (table) => {
    return [
      // https://github.com/drizzle-team/drizzle-orm/issues/3596
      primaryKey({
        columns: [table.hackathonId, table.userId],
      }),
    ];
  }
);

export const insertApplicationSchema = createInsertSchema(applications).pick({
  hackathonId: true,
  response: true,
});

export const queryApplicationsSchema = z.object({
  hackathonId: z.number().int(),
  userId: z.string().uuid().optional(),
  maxResult: z.number().int().optional().default(100),
  nextToken: z.string().regex(/^\d+$/g).optional(),
});
