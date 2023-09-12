import Client from "@fluentci.io/dagger";

export enum Job {
  validate = "validate",
  deploy = "deploy",
  push = "push",
}

const DATABASE_URL = Deno.env.get("DATABASE_URL");

const exclude = [".git", "node_modules", ".fluentci", ".env"];

export const validate = async (client: Client, src = ".") => {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

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
    .withEnvVariable("DATABASE_URL", DATABASE_URL)
    .withExec(["sh", "-c", 'eval "$(devbox global shellenv)" && bun install'])
    .withExec([
      "sh",
      "-c",
      `eval "$(devbox global shellenv)" && bun x prisma validate`,
    ]);

  const result = await ctr.stdout();

  console.log(result);
};

export const deploy = async (client: Client, src = ".") => {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

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
    .withEnvVariable("DATABASE_URL", DATABASE_URL)
    .withExec(["sh", "-c", 'eval "$(devbox global shellenv)" && bun install'])
    .withExec([
      "sh",
      "-c",
      `eval "$(devbox global shellenv)" && bun x prisma migrate deploy`,
    ]);

  const result = await ctr.stdout();

  console.log(result);
};

export const push = async (client: Client, src = ".") => {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

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
    .withEnvVariable("DATABASE_URL", DATABASE_URL)
    .withExec(["sh", "-c", 'eval "$(devbox global shellenv)" && bun install'])
    .withExec([
      "sh",
      "-c",
      `eval "$(devbox global shellenv)" && bun x prisma db push`,
    ]);

  const result = await ctr.stdout();

  console.log(result);
};

export type JobExec = (
  client: Client,
  src?: string
) =>
  | Promise<void>
  | ((
      client: Client,
      src?: string,
      options?: {
        ignore: string[];
      }
    ) => Promise<void>);

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
