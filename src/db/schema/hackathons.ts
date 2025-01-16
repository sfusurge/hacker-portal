import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

const hackathons = pgTable('hackathons', {
  id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  startDate: varchar('start_date', { length: 255 }).notNull(),
  endDate: varchar('end_date', { length: 255 }).notNull(),
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
