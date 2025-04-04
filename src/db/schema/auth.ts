import { boolean, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import { pgTable, integer } from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from 'next-auth/adapters';
import { users } from './users/users';

export const accounts = pgTable(
    'account',
    {
        userId: integer('userId')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        type: text('type').$type<AdapterAccountType>().notNull(),
        provider: text('provider').notNull(),
        providerAccountId: text('provider_account_id').notNull(),
        refresh_token: text('refresh_token'),
        access_token: text('access_token'),
        expires_at: integer('expires_at'),
        token_type: text('token_type'),
        scope: text('scope'),
        id_token: text('id_token'),
        session_state: text('session_state'),
    },
    (account) => [
        {
            compoundKey: primaryKey({
                columns: [account.provider, account.providerAccountId],
            }),
        },
    ]
);

export const verificationTokens = pgTable(
    'verification_token',
    {
        identifier: text('identifier').notNull(),
        token: text('token').notNull(),
        expires: timestamp('expires', { mode: 'date' }).notNull(),
    },
    (verificationToken) => [
        {
            compositePk: primaryKey({
                columns: [
                    verificationToken.identifier,
                    verificationToken.token,
                ],
            }),
        },
    ]
);

export const authenticators = pgTable(
    'authenticator',
    {
        credentialID: text('credential_id').notNull().unique(),
        userId: integer('userId')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        providerAccountId: text('provider_account_id').notNull(),
        credentialPublicKey: text('credential_public_key').notNull(),
        counter: integer('counter').notNull(),
        credentialDeviceType: text('credential_device_type').notNull(),
        credentialBackedUp: boolean('credential_backed_up').notNull(),
        transports: text('transports'),
    },
    (authenticator) => [
        {
            compositePK: primaryKey({
                columns: [authenticator.userId, authenticator.credentialID],
            }),
        },
    ]
);
