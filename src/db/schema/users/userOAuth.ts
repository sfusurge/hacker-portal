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
    DISCORD: 'discord',
    MICROSOFT: 'microsoft',
    EMAIL_LINK: 'email_link',
    NULL: 'n/a',
};

export type ProvidersEnumType = typeof ProvidersEnum;

export const providerDbEnum = pgEnum('oauth_provider', [
    ProvidersEnum.GITHUB,
    ProvidersEnum.GOOGLE,
    ProvidersEnum.DISCORD,
    ProvidersEnum.MICROSOFT,
    ProvidersEnum.EMAIL_LINK,
    ProvidersEnum.NULL,
]);

export const userOAuth = pgTable(
    'user_oauth',
    {
        userId: integer('user_id')
            .notNull()
            .references(() => users.id, {
                onDelete: 'cascade',
            }),
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
