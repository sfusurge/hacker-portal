import dotenv from 'dotenv';
import postgres from 'postgres';

import { exec } from 'child_process';
import { resolve } from 'path';
import { promisify } from 'util';

const execPromise = promisify(exec);

const drizzleKit = resolve('./node_modules/.bin/drizzle-kit');

// https://vitest.dev/config/#globalsetup
export default async function setup() {
  // Throw error if using development or production env for testing
  console.log(`Setting up test database`);

  const config = loadEnvAndValidate();

  const sql = await createDatabase(config);

  await populateTables();

  return async () => {
    const { database } = config;

    await dropDatabase(sql, database);

    await sql.end();
  };
}

function loadEnvAndValidate(): DatabaseConfig {
  dotenv.config({ debug: true, override: true });

  const {
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_USER,
    DATABASE_PASSWORD,
    DATABASE_NAME,
  } = process.env;

  if (!DATABASE_HOST) {
    throw new Error(`env missing DATABASE_HOST`);
  }

  if (!DATABASE_PORT) {
    throw new Error(`env missing DATABASE_PORT`);
  }

  if (!DATABASE_USER) {
    throw new Error(`env missing DATABASE_USER`);
  }

  if (!DATABASE_PASSWORD) {
    throw new Error(`env missing DATABASE_PASSWORD`);
  }
  if (!DATABASE_NAME) {
    throw new Error(`env missing DATABASE_NAME`);
  }

  const config: DatabaseConfig = {
    host: DATABASE_HOST,
    port: Number(DATABASE_PORT),
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: `${DATABASE_NAME}_test`,
  };

  // Override variables so that drizzle.config.ts use the test database instead
  process.env.DATABASE_NAME = config.database;

  console.debug(
    'Loaded config',
    JSON.stringify(
      config,
      (key, value) => (key === 'password' ? '<redacted>' : value),
      4
    )
  );

  return config;
}

async function createDatabase(config: DatabaseConfig): Promise<postgres.Sql> {
  const sql = postgres({
    host: config.host,
    user: config.user,
    password: config.password,
    database: 'postgres',
  });

  await sql`DROP DATABASE IF EXISTS ${sql(config.database)}`;
  await sql`CREATE DATABASE ${sql(config.database)}`;

  return sql;
}

async function dropDatabase(sql: postgres.Sql, databaseName: string) {
  await sql`DROP DATABASE IF EXISTS ${sql(databaseName)}`;

  console.debug(`Dropped database ${sql(databaseName)}`);
}

async function populateTables(): Promise<void> {
  await execPromise(`${drizzleKit} push`);
  console.log('> drizzle-kit push');
}

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}
