import { mysqlTable, primaryKey, varchar } from "drizzle-orm/mysql-core";
import { users } from "./users";
import { hackathons } from "./hackathons";

const applications = mysqlTable(
  "applications",
  {
    userId: varchar("user_id", { length: 128 }).references(() => users.id),
    hackathonId: varchar("hackathon_id", { length: 128 }).references(
      () => hackathons.hackathon_id
    ),
  },
  (table) => {
    return {
      id: primaryKey({ columns: [table.userId, table.hackathonId] }),
    };
  }
);
