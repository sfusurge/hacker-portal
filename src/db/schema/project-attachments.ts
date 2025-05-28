import {
    integer,
    pgTable,
    primaryKey,
    text,
    timestamp,
} from 'drizzle-orm/pg-core';
import { user } from './users/users';

export const projectAttachments = pgTable(
    'project_attachments',
    {
        teamId: integer('team_id')
            .references(() => user.id, { onDelete: 'no action' })
            .notNull(),
        // can be anything (file name, or fixed string, etc.)
        name: text('name')
            .notNull()
            .$default(() => crypto.randomUUID()),
        url: text('url').notNull(),
        downloadUrl: text('download_url').notNull(),
        createdDate: timestamp('created_date').defaultNow().notNull(),
    },
    (table) => {
        return [
            // https://github.com/drizzle-team/drizzle-orm/issues/3596
            primaryKey({
                columns: [table.teamId, table.name],
            }),
        ];
    }
);
