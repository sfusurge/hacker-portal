import { mysqlTable, varchar, date } from "drizzle-orm/mysql-core";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

import { createInsertSchema, createSelectSchema } from "drizzle-zod";

const hackathons = mysqlTable("hackathons", {
    hackathon_id: varchar("hackathon_id", { length: 128 })
        .primaryKey()
        .$defaultFn(() => createId()),
    name: varchar("name", { length: 255 }).notNull(),
    start_date: date("start_date").notNull(),
    end_date: date("end_date").notNull(),
});

const insertHackathonSchema = createInsertSchema(hackathons, {
    hackathon_id: (schema) => schema.hackathon_id.optional(),
}).omit({ hackathon_id: true });

const deleteHackathonSchema = z.object({
    hackathon_id: z.string().min(1),
});

const updateHackathonSchema = z.object({
    hackathon_id: z.string(),
    name: z.string(),
    start_date: z.date().optional(),
    end_date: z.date().optional(),
})

const selectHackathonSchema = createSelectSchema(hackathons);

export { hackathons, insertHackathonSchema, selectHackathonSchema, deleteHackathonSchema, updateHackathonSchema };
