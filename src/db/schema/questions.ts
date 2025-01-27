import {
    boolean,
    integer,
    pgEnum,
    pgTable,
    primaryKey,
    serial,
    varchar,
} from 'drizzle-orm/pg-core';
import { hackathons } from './hackathons';

export const questionTypeEnum = pgEnum('type', [
    'MULTIPLE_CHOICE',
    'TEXT',
    'NUMBER',
    'CHECKBOX',
    'TEXT_AREA',
]);

export const questions = pgTable(
    'questions',
    {
        hackathonId: integer('hackathon_id')
            .references(() => hackathons.id)
            .notNull(),
        questionNumber: serial('question_number'),
        content: varchar('content', { length: 2048 }).notNull(),
        type: questionTypeEnum().notNull(),
        required: boolean('required').default(true),
    },
    (table) => {
        return [
            primaryKey({
                columns: [table.hackathonId, table.questionNumber],
            }),
        ];
    }
);
