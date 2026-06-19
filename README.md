<a href="https://vercel.com/oss">
  <img alt="Vercel OSS Program" src="https://vercel.com/oss/program-badge.svg" />
</a>
<br />
<br />
The source code repository for hacker portal, SFU Surge's all-in-one hackathon application management system

## Installation and Setup

1. First, ensure that you are using a stable and/or lts version of node > `v20` (highly recommend using [nvm](https://github.com/nvm-sh/nvm) and utilizing the `.nvmrc` file in the repository)

2. Have a running instance of MySQL, with a database and user credentials prepared ahead of time

3. Have `pnpm` installed:

```
npm install -g pnpm@latest
```

and then run `pnpm install` within the project directory to install the packages

## Environment Settings

Copy and paste the following settings into your local `.env` file, and fill out all the fields with the correct credentials

### Discord announcements ingestion

If you are running the Discord announcements pipeline, also set:

```env
# Bearer secret for POST/DELETE /api/webhooks/discord. Must match PORTAL_API_SECRET
# in the portal-discord-bot repo's .env. Treat as production secret.
DISCORD_INGEST_SECRET=<long random string>

# Optional. Set exactly to "false" to disable all Discord ingest (403 after auth).
# DISCORD_INGEST_ENABLED=false

# Optional. In-memory requests per minute per server instance (default 120).
# DISCORD_INGEST_RATE_LIMIT_PER_MINUTE=120

# Optional. Set to "true" to rehost Discord attachments into Cloudflare R2
# during webhook ingest. Requires all R2 vars below.
# DISCORD_ATTACHMENT_REHOST_ENABLED=true

# Required when DISCORD_ATTACHMENT_REHOST_ENABLED=true.
# R2 endpoint + credentials + bucket name.
# R2_ENDPOINT=
# R2_ACCESS_KEY_ID=
# R2_SECRET_ACCESS_KEY=
# R2_BUCKET_NAME=
# R2_PUBLIC_DOMAIN=
```

## Running the application

#### Generating and Pushing `Drizzle` Migrations to your database

1. You can use `docker-compose` to create the local postgresql database

```sh
# just run to run the docker-compose.yaml db configs.
# then remember to toggle .env file to the local url
docker-compose up
```

1. If you have made additions/modifications to the drizzle schema, please first run `pnpm drizzle-kit generate`
1. Then to persist your changes to your database, run `pnpm drizzle-kit push`

#### Development

```bash
pnpm run dev
```

or

```
npm run dev
```

#### Local Production

```bash
pnpm run build
pnpm run start
```

or

```bash
npm run build
npm run start
```

## Neon Postgres

See notion page for login credentials are env variables

- Neon auto scaling is in effect, currently in development, scaling range is set to 0 to 0.5x. In prod the max range can be up to 2x resource.

## Design

- See design [figma workspace](https://www.figma.com/design/02aQ4FvurxQn9sPqaCTqZn/Ottertable-High-Fidelity-Wireframes?node-id=482-5020&p=f&m=dev)
