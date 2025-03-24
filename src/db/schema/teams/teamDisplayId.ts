import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { teams } from './teams';

export const teamDisplayIds = pgTable('team_display_id', {
    displayId: varchar('display_id', { length: 6 }).notNull().primaryKey(),
    teamId: integer('team_id')
        .references(() => teams.id, { onDelete: 'cascade' })
        .notNull()
        .unique(),
});
