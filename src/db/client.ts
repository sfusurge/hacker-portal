import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"

const pool = mysql.createPool(process.env.DATABASE_URL || "jdbc:mysql://localhost:3306/portaldb?allowPublicKeyRetrieval=true&useSSL=false")

const db = drizzle(pool)