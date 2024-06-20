import { defineConfig } from "drizzle-kit"

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL || "jdbc:mysql://localhost:3306/portaldb?allowPublicKeyRetrieval=true&useSSL=false"
    },
    verbose: true,

})