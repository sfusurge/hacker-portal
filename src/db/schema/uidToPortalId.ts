import { pgTable, varchar, integer } from 'drizzle-orm/pg-core';
import { user } from './users/users';

/**
 * Mapping between a portal user ID and an NFC tag UID.
 * portalId is the primary key.
 */
export const UIDToPortalID = pgTable('UIDToPortalID', {
    portalId: integer('portal_id')
        .primaryKey()
        .references(() => user.id, { onDelete: 'cascade' }),
    uid: varchar('uid', { length: 64 }).notNull(),
});
