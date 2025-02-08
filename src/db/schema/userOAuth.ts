/**
 * TODO
 * OAuth data for the user, will store this data for future use, currently useless.
 *
 * No trpc endpoints for now.
 */

import { integer, pgEnum, pgTable, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './users';

export const ProvidersEnum = {
    GOOGLE: 'google',
    GITHUB: 'github',
    NULL: 'n/a',
};

export type ProvidersEnumType = typeof ProvidersEnum;

export const providerDbEnum = pgEnum('oauth_provider', [
    ProvidersEnum.GITHUB,
    ProvidersEnum.GOOGLE,
    ProvidersEnum.NULL,
]);

export const userOAuth = pgTable(
    'user_oauth',
    {
        userId: integer('user_id')
            .references(() => users.id, {
                onDelete: 'cascade',
            })
            // Add notNull: https://github.com/dotnize/tanstarter/issues/4#issuecomment-2558832778
            .notNull(),
        provider: providerDbEnum('provider').default('n/a').notNull(),
    },
    (table) => {
        return [
            // https://github.com/drizzle-team/drizzle-orm/issues/3596
            primaryKey({
                columns: [table.userId, table.provider],
            }),
        ];
    }
);
