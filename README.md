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

```YAML
DATABASE_HOST=
DATABASE_PORT=
DATABASE_NAME=
DATABASE_USER=
DATABASE_PASSWORD=
CLIENT_URL=
```

## Running the application

#### Generating and Pushing `Drizzle` Migrations to your database

1. If you have made additions/modifications to the drizzle schema, please first run `pnpm drizzle-kit generate`
2. Then to persist your changes to your database, run `pnpm drizzle-kit push`

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
