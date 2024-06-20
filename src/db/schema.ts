import { MySqlTable, int, mysqlTable, text } from "drizzle-orm/mysql-core"

export const users = mysqlTable("users", {
    id: text("id").primaryKey(),
    first_name: text("first_name"),
    last_name: text("last_name"),
    email: text("email").unique()
})