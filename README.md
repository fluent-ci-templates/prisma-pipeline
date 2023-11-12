# Prisma Pipeline

[![fluentci pipeline](https://img.shields.io/badge/dynamic/json?label=pkg.fluentci.io&labelColor=%23000&color=%23460cf1&url=https%3A%2F%2Fapi.fluentci.io%2Fv1%2Fpipeline%2Fprisma_pipeline&query=%24.version)](https://pkg.fluentci.io/prisma_pipeline)
![deno compatibility](https://shield.deno.dev/deno/^1.37)
[![](https://img.shields.io/codecov/c/gh/fluent-ci-templates/prisma-pipeline)](https://codecov.io/gh/fluent-ci-templates/prisma-pipeline)

A ready-to-use CI/CD Pipeline for managing your database migrations with [Prisma Migrate](https://www.prisma.io/docs/guides/migrate)

## 🚀 Usage

Run the following command in your project:

```bash
fluentci run prisma_pipeline
```

Or, if you want to use it as a template:

```bash
fluentci init -t prisma
```

This will create a `.fluentci` folder in your project.

Now you can run the pipeline with:

```bash
fluentci run .
```

## Environment variables

| Variable         | Description                    |
| ---------------- | ------------------------------ |
| DATABASE_URL     | The database connection string |

## Jobs

| Job       | Description               |
| --------- | ------------------------- |
| validate  | Validate prisma schema    |
| deploy    | Deploy all migrations     |
| push      | Apply schema changes      |

```graphql
deploy(databaseUrl: String!, src: String!): String
push(databaseUrl: String!, src: String!): String
validate(databaseUrl: String!, src: String!): String
```

## Programmatic usage

You can also use this pipeline programmatically:

```ts
import { deploy } from "https://pkg.fluentci.io/prisma_pipeline@v0.4.2/mod.ts";

await deploy();
```

Or:

```ts
import { validate, push } from "https://pkg.fluentci.io/prisma_pipeline@v0.4.2/mod.ts";

// validate prisma schema and apply schema changes
await validate();
await push();
```
