import { pgEnum } from 'drizzle-orm/pg-core';

export const judgingKindEnum = pgEnum('judging_kind', ['software', 'hardware']);

export type JudgingKind = (typeof judgingKindEnum)['enumValues'][number];
