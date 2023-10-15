import Client, { connect } from "../../deps.ts";

export enum Job {
  validate = "validate",
  deploy = "deploy",
  push = "push",
}

const DATABASE_URL = Deno.env.get("DATABASE_URL");

export const exclude = [".git", "node_modules", ".fluentci", ".env"];

export const validate = async (src = ".", databaseUrl?: string) => {
  if (!DATABASE_URL && !databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }
  await connect(async (client: Client) => {
    const context = client.host().directory(src);
    const ctr = client
      .pipeline(Job.validate)
      .container()
      .from("ghcr.io/fluent-ci-templates/bun:latest")
      .withMountedCache(
        "/app/node_modules",
        client.cacheVolume("prisma_node_modules")
      )
      .withDirectory("/app", context, { exclude })
      .withWorkdir("/app")
      .withEnvVariable("DATABASE_URL", DATABASE_URL || databaseUrl!)
      .withExec(["sh", "-c", 'eval "$(devbox global shellenv)" && bun install'])
      .withExec([
        "sh",
        "-c",
        `eval "$(devbox global shellenv)" && bun x prisma validate`,
      ]);

    await ctr.stdout();
  });

  return "Schema validated";
};

export const deploy = async (src = ".", databaseUrl?: string) => {
  if (!DATABASE_URL && !databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  await connect(async (client: Client) => {
    const mysql = client
      .container()
      .from("mysql")
      .withEnvVariable("MYSQL_ROOT_PASSWORD", "pass")
      .withEnvVariable("MYSQL_DATABASE", "example")
      .withExposedPort(3306);

    const context = client.host().directory(src);
    const ctr = client
      .pipeline(Job.deploy)
      .container()
      .from("ghcr.io/fluent-ci-templates/bun:latest")
      .withServiceBinding("mysql", mysql)
      .withMountedCache(
        "/app/node_modules",
        client.cacheVolume("prisma_node_modules")
      )
      .withDirectory("/app", context, { exclude })
      .withWorkdir("/app")
      .withEnvVariable("DATABASE_URL", DATABASE_URL || databaseUrl!)
      .withExec(["sh", "-c", 'eval "$(devbox global shellenv)" && bun install'])
      .withExec([
        "sh",
        "-c",
        `eval "$(devbox global shellenv)" && bun x prisma migrate deploy`,
      ]);

    await ctr.stdout();
  });

  return "All migrations deployed";
};

export const push = async (src = ".", databaseUrl?: string) => {
  if (!DATABASE_URL && !databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  await connect(async (client: Client) => {
    const mysql = client
      .container()
      .from("mysql")
      .withEnvVariable("MYSQL_ROOT_PASSWORD", "pass")
      .withEnvVariable("MYSQL_DATABASE", "example")
      .withExposedPort(3306);

    const context = client.host().directory(src);
    const ctr = client
      .pipeline(Job.push)
      .container()
      .from("ghcr.io/fluent-ci-templates/bun:latest")
      .withServiceBinding("mysql", mysql)
      .withMountedCache(
        "/app/node_modules",
        client.cacheVolume("prisma_node_modules")
      )
      .withDirectory("/app", context, { exclude })
      .withWorkdir("/app")
      .withEnvVariable("DATABASE_URL", DATABASE_URL || databaseUrl!)
      .withExec(["sh", "-c", 'eval "$(devbox global shellenv)" && bun install'])
      .withExec([
        "sh",
        "-c",
        `eval "$(devbox global shellenv)" && bun x prisma db push`,
      ]);

    await ctr.stdout();
  });

  return "All schema changes applied";
};

export type JobExec = (
  src?: string,
  databaseUrl?: string
) =>
  | Promise<string>
  | ((
      src?: string,
      databaseUrl?: string,
      options?: {
        ignore: string[];
      }
    ) => Promise<string>);

export const runnableJobs: Record<Job, JobExec> = {
  [Job.validate]: validate,
  [Job.deploy]: deploy,
  [Job.push]: push,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.validate]: "Validate prisma schema",
  [Job.deploy]: "Deploy all migrations",
  [Job.push]: "Apply schema changes",
};
