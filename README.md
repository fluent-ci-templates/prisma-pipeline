# Prisma Pipeline

[![fluentci pipeline](https://shield.fluentci.io/x/prisma_pipeline)](https://pkg.fluentci.io/prisma_pipeline)
![deno compatibility](https://shield.deno.dev/deno/^1.42)
[![dagger-min-version](https://shield.fluentci.io/dagger/v0.11.7)](https://dagger.io)
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

## Dagger Module

Use as a [Dagger](https://dagger.io) Module:

```bash
dagger mod install github.com/fluent-ci-templates/prisma-pipeline@mod
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

```typescript
validate(
  src: string | Directory,
  databaseUrl: string | Secret
): Promise<string>

deploy(
  src: string | Directory,
  databaseUrl: string | Secret
): Promise<string>

push(
  src: string | Directory,
  databaseUrl: string | Secret
): Promise<string>
```

## Programmatic usage

You can also use this pipeline programmatically:

```ts
import { deploy } from "jsr:@fluentci/prisma";

await deploy(".", Deno.env.get("DATABASE_URL")!);
```

Or:

```ts
import { validate, push } from "jsr:@fluentci/prisma";

// validate prisma schema and apply schema changes
await validate(".", Deno.env.get("DATABASE_URL")!);
await push(".", Deno.env.get("DATABASE_URL")!);
```
