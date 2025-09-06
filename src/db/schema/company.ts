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

export const companyRoleEnum = pgEnum('company_role', ['mentor', 'judge']);

export const company = pgTable(
    'company',
    {
        hackathonId: integer('hackathon_id')
            .references(() => hackathons.id)
            .notNull(),
        userId: integer('user_id')
            .references(() => user.id, { onDelete: 'no action' })
            .notNull(),
        role: companyRoleEnum('role').notNull(),
        companyData: json('company_data').$type<string>(),
        companyRole: json('company_role_data').$type<string>(),
        skills: json('skills').$type<string[]>(),
        createdDate: timestamp('created_date').defaultNow().notNull(),
        updatedDate: timestamp('updated_date').defaultNow().notNull(),
    },
    (table) => {
        return [primaryKey({ columns: [table.hackathonId, table.userId] })];
    }
);
