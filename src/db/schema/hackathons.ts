import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

const hackathons = pgTable('hackathons', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  startDate: varchar('start_date', { length: 255 }).notNull(),
  endDate: varchar('end_date', { length: 255 }).notNull(),
});

const insertHackathonSchema = createInsertSchema(hackathons, {
  id: (id) => id.optional(),
  startDate: (startDate) => startDate.date(),
  endDate: (endDate) => endDate.date(),
});

const deleteHackathonSchema = z.object({
  id: z.string().min(1),
});

const selectHackathonSchema = createSelectSchema(hackathons);

export {
  deleteHackathonSchema,
  hackathons,
  insertHackathonSchema,
  selectHackathonSchema,
};
