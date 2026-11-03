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

```sh
npm install -g pnpm@latest
pnpm install
```

4. Copy [`.env.example`](.env.example) to `.env` and fill in credentials (shared values may be on the team Notion).

## Environment Settings

See [`.env.example`](.env.example) for all variables. At minimum you need `DBURL`, `NEXTAUTH_SECRET`, and OAuth provider credentials for the sign-in methods you use.

### Discord announcements ingestion

If you are running the Discord announcements pipeline (via [`portal-discord-bot`](../portal-discord-bot/)), also set:

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

Local `DBURL` (matches `docker-compose.yaml`):

```text
postgres://root:12345@localhost:5432/portaldb
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

## Cloudflare Workers

The portal can also be deployed to Cloudflare Workers with the
[OpenNext adapter](https://opennext.js.org/cloudflare). Config lives in
[`wrangler.jsonc`](wrangler.jsonc) and [`open-next.config.ts`](open-next.config.ts).

```bash
pnpm cf:build     # next build + adapt it into .open-next/
pnpm cf:preview   # build, then serve the Worker locally on http://localhost:8787
pnpm cf:deploy    # build and deploy to your Cloudflare account
```

`wrangler dev` reads `.env` for local previews. A deployed Worker needs the same
names as encrypted secrets:

```bash
pnpm wrangler secret put DBURL
pnpm wrangler secret put BETTER_AUTH_SECRET
# ...one per variable in .env.example that the portal uses
```

Point `BETTER_AUTH_URL` (and `BETTER_AUTH_COOKIE_DOMAIN` if you share the cookie
with other subdomains) at the Worker hostname before signing in. The email-queue
cron is configured in `wrangler.jsonc` (`*/30 * * * *`) and authenticates with
`CRON_SECRET`, same as `vercel.json`.

## Neon Postgres

See notion page for login credentials are env variables

- Neon auto scaling is in effect, currently in development, scaling range is set to 0 to 0.5x. In prod the max range can be up to 2x resource.

## Design

- See design [figma workspace](https://www.figma.com/design/02aQ4FvurxQn9sPqaCTqZn/Ottertable-High-Fidelity-Wireframes?node-id=482-5020&p=f&m=dev)
