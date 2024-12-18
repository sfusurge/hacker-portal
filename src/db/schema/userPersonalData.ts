import {
  boolean,
  check,
  integer,
  json,
  pgEnum,
  pgTable,
  serial,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { hackathons } from './hackathons';
import { sql } from 'drizzle-orm';

const levelStudyEnum = pgEnum('levelStudy', ['A', 'B', 'C']); //TODO: fill this enum with real values.

const userPseronalData = pgTable(
  'userPersonalData',
  {
    id: serial('id').primaryKey(),
    userId: varchar('userId').references(() => users.id),
    hackathonId: varchar('hackathonId').references(() => hackathons.id),

    // https://guide.mlh.io/general-information/managing-registrations/registration-timelines
    // all MLH required data are here, even if they overlap.
    // for example if a user applies with different email to 2 hackathons, it might be nice to track both.

    // an alternative is that we can just have everything here be in a json field :/

    // required fields
    firstName: varchar('firstName', { length: 100 }).notNull(),
    lastName: varchar('lastName', { length: 100 }).notNull(),
    age: integer('age').notNull(),
    phoneNumber: varchar('phoneNumber', { length: 20 }).notNull(),
    email: varchar('email', { length: 150 }).notNull(),
    school: varchar('school', { length: 100 }).notNull(),
    levelStudy: levelStudyEnum('levelStudy').default('A'),
    country: integer('country').notNull(), // iso 3166 country code as int, see https://github.com/mledoze/countries for conversions
    socials: json('socials'), // optionally provide any amount of social links, such as github or linkedin

    // checkbox, if user has agreed to conditions
    // Code of conduct is required
    // Authorization to use and share personal data by MLH
    // no need to track these 2
    agreeToMLHAds: boolean('agreeToMLHAds'),

    // optional fields
    // TBD, and SHOULD NOT be part of the table schema, make all optionals into a json instead
    // since they could change each year.
  },
  (table) => [
    // do data consistency checks here as needed.
    check('age', sql`${table.age} > 10`),
  ]
);
