import { integer, pgTable, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

export const userDisplayIds = pgTable('user_display_id', {
    displayId: varchar('display_id', { length: 6 }).notNull().primaryKey(),
    userId: integer('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
});
