import { Directory, Secret, dag } from "../../deps.ts";
import { getDirectory, getDatabaseUrl } from "./lib.ts";

export enum Job {
  validate = "validate",
  deploy = "deploy",
  push = "push",
}

export const exclude = [".git", "node_modules", ".fluentci", ".env"];

/**
 * @function
 * @description Validate prisma schema
 * @param {string | Directory} src
 * @param {string | Secret} databaseUrl
 * @returns {string}
 */
export async function validate(
  src: string | Directory,
  databaseUrl: string | Secret
): Promise<string> {
  const context = await getDirectory(dag, src);
  const secret = await getDatabaseUrl(dag, databaseUrl);
  if (!secret) {
    console.error("DATABASE_URL is not set");
    Deno.exit(1);
  }
  const ctr = dag
    .pipeline(Job.validate)
    .container()
    .from("pkgxdev/pkgx:latest")
    .withExec(["apt-get", "update"])
    .withExec(["apt-get", "install", "-y", "ca-certificates"])
    .withExec(["pkgx", "install", "node", "bun@1.0.0"])
    .withMountedCache(
      "/app/node_modules",
      dag.cacheVolume("prisma_node_modules")
    )
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withSecretVariable("DATABASE_URL", secret)
    .withExec(["bun", "install"])
    .withExec(["bunx", "prisma", "validate"]);

  const result = await ctr.stdout();

  return result;
}

/**
 * @function
 * @description Deploy all migrations
 * @param {string | Directory} src
 * @param {string | Secret} databaseUrl
 * @returns {string}
 */
export async function deploy(
  src: string | Directory,
  databaseUrl: string | Secret
): Promise<string> {
  const mysql = dag
    .container()
    .from("mysql")
    .withEnvVariable("MYSQL_ROOT_PASSWORD", "pass")
    .withEnvVariable("MYSQL_DATABASE", "example")
    .withExposedPort(3306)
    .asService();

  const context = await getDirectory(dag, src);
  const secret = await getDatabaseUrl(dag, databaseUrl);

  if (!secret) {
    console.error("DATABASE_URL is not set");
    Deno.exit(1);
  }

  const ctr = dag
    .pipeline(Job.deploy)
    .container()
    .from("pkgxdev/pkgx:latest")
    .withExec(["apt-get", "update"])
    .withExec(["apt-get", "install", "-y", "ca-certificates"])
    .withExec(["pkgx", "install", "node", "bun@1.0.0"])
    .withServiceBinding("mysql", mysql)
    .withMountedCache(
      "/app/node_modules",
      dag.cacheVolume("prisma_node_modules")
    )
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withSecretVariable("DATABASE_URL", secret)
    .withExec(["bun", "install"])
    .withExec(["bunx", "prisma", "migrate", "deploy"]);

  const result = await ctr.stdout();

  return result;
}

/**
 * @function
 * @description Apply schema changes
 * @param {string | Directory} src
 * @param {string | Secret} databaseUrl
 * @returns {string}
 */
export async function push(
  src: string | Directory,
  databaseUrl: string | Secret
): Promise<string> {
  const mysql = dag
    .container()
    .from("mysql")
    .withEnvVariable("MYSQL_ROOT_PASSWORD", "pass")
    .withEnvVariable("MYSQL_DATABASE", "example")
    .withExposedPort(3306)
    .asService();

  const context = await getDirectory(dag, src);
  const secret = await getDatabaseUrl(dag, databaseUrl);
  if (!secret) {
    console.error("DATABASE_URL is not set");
    Deno.exit(1);
  }

  const ctr = dag
    .pipeline(Job.push)
    .container()
    .from("pkgxdev/pkgx:latest")
    .withExec(["apt-get", "update"])
    .withExec(["apt-get", "install", "-y", "ca-certificates"])
    .withExec(["pkgx", "install", "node", "bun@1.0.0"])
    .withServiceBinding("mysql", mysql)
    .withMountedCache(
      "/app/node_modules",
      dag.cacheVolume("prisma_node_modules")
    )
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withSecretVariable("DATABASE_URL", secret)
    .withExec(["bun", "install"])
    .withExec(["bunx", "prisma", "db", "push"]);

  const result = await ctr.stdout();

  return result;
}

export type JobExec = (src: string, databaseUrl: string) => Promise<string>;

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
