import { mysqlTable, varchar, date } from "drizzle-orm/mysql-core";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

import { createInsertSchema, createSelectSchema } from "drizzle-zod";

const hackathons = mysqlTable("hackathons", {
    id: varchar("hackathon_id", { length: 128 })
        .primaryKey()
        .$defaultFn(() => createId()),
    name: varchar("name", { length: 255 }).notNull(),
    start_date: varchar("start_date", { length: 255 }).notNull(),
    end_date: varchar("end_date", { length: 255 }).notNull(),
});

const insertHackathonSchema = createInsertSchema(hackathons, {
    id: (schema) => schema.id.optional(),
    name: (schema) => schema.name,
    start_date: (schema) => schema.start_date.date(),
    end_date: (schema) => schema.end_date.date(),
}).omit({ id: true });

const deleteHackathonSchema = z.object({
    id: z.string().min(1),
});

const updateHackathonSchema = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
})

const selectHackathonSchema = createSelectSchema(hackathons);

export { hackathons, insertHackathonSchema, selectHackathonSchema, deleteHackathonSchema, updateHackathonSchema };
