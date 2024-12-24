import {
  boolean,
  integer,
  json,
  pgEnum,
  pgTable,
  serial,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { hackathons } from './hackathons/hackathons';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { z } from 'zod';

export const levelStudyEnum = pgEnum('levelStudy', [
  'High School',
  'Undergraduate University (2 years)',
  'Usergraduate University (3+ years)',
  'Graduate University',
  'Code School / Bootcamp',
  'Trade Program / APprenticeship',
  'Post Doctorate',
  'Other',
  'Not a student',
  'N/A',
]); //TODO: fill this enum with real values.

export const userPseronalData = pgTable('userPersonalData', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, {
    onDelete: 'no action',
  }),
  hackathonId: integer('hackathon_id').references(() => hackathons.id, {
    onDelete: 'cascade',
  }),

  // https://guide.mlh.io/general-information/managing-registrations/registration-timelines
  // all MLH required data are here, even if they overlap.
  // for example if a user applies with different email to 2 hackathons, it might be nice to track both.

  // an alternative is that we can just have everything here be in a json field :/

  // required fields
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  age: integer('age').notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  email: varchar('email', { length: 150 }).notNull(),
  school: varchar('school', { length: 100 }).notNull(),
  levelStudy: levelStudyEnum('level_study').default('N/A'),
  country: integer('country').notNull(), // iso 3166 country code as int, see https://github.com/mledoze/countries for conversions
  socials: json('socials'), // optionally provide any amount of social links, such as github or linkedin

  // checkbox, if user has agreed to conditions
  // Code of conduct is required
  // Authorization to use and share personal data by MLH
  // no need to track these 2
  agreeToMLHAds: boolean('agree_to_mlh_ads').default(false),

  // optional fields
  // TBD, and SHOULD NOT be part of the table schema, make all optionals into a json instead
  // since they could change each year.
});

const insertPersonalData = createInsertSchema(userPseronalData, {
  id: (id) => id.int().min(0),
});

const deletePersonalData = z.object({
  id: z.number().int(),
});

const selectPersonalData = createSelectSchema(userPseronalData);

const updatePersonalData = createUpdateSchema(userPseronalData, {});

export {
  insertPersonalData,
  deletePersonalData,
  selectPersonalData,
  updatePersonalData,
};
