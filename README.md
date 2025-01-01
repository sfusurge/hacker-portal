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
