import {
    integer,
    json,
    pgTable,
    primaryKey,
    timestamp,
    pgEnum,
} from 'drizzle-orm/pg-core';
import { hackathons } from './hackathons';
import { user } from './users/users';

export const portalRoleEnum = pgEnum('company_role', ['mentor', 'sponsor']);
export const sponsorTierEnum = pgEnum('sponsor_tier', [
    'plat',
    'gold',
    'title',
]);

export const company = pgTable(
    'company',
    {
        hackathonId: integer('hackathon_id')
            .references(() => hackathons.id)
            .notNull(),
        userId: integer('user_id')
            .references(() => user.id, { onDelete: 'no action' })
            .notNull(),
        portalRole: portalRoleEnum('role').notNull(),
        sponsorTierEnum: sponsorTierEnum('sponsor_tier'),
        companyTitle: json('company_title').$type<string>(),
        skills: json('skills').$type<string[]>(),
        createdDate: timestamp('created_date').defaultNow().notNull(),
        updatedDate: timestamp('updated_date').defaultNow().notNull(),
    },
    (table) => {
        return [primaryKey({ columns: [table.hackathonId, table.userId] })];
    }
);
