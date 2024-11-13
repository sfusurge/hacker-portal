import { mysqlTable, varchar, date } from 'drizzle-orm/mysql-core';
import { createId } from '@paralleldrive/cuid2';

import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

const hackathons = mysqlTable('hackathons', {
  hackathon_id: varchar('hackathon_id', { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar('name', { length: 255 }).notNull(),
  start_date: varchar('start_date', { length: 255 }).notNull(),
  end_date: varchar('end_date', { length: 255 }).notNull(),
});

const insertHackathonSchema = createInsertSchema(hackathons, {
  hackathon_id: (schema) => schema.hackathon_id.optional(),
  start_date: (schema) => schema.start_date.date(),
  end_date: (schema) => schema.end_date.date(),
}).omit({ hackathon_id: true });

const deleteHackathonSchema = z.object({
  id: z.string().min(1),
});

const selectHackathonSchema = createSelectSchema(hackathons);

export {
  hackathons,
  insertHackathonSchema,
  deleteHackathonSchema,
  selectHackathonSchema,
};
