import Client, {
  Directory,
  DirectoryID,
  Secret,
  SecretID,
} from "../../deps.ts";

export const getDirectory = async (
  client: Client,
  src: string | Directory | undefined = "."
) => {
  if (typeof src === "string") {
    try {
      const directory = client.loadDirectoryFromID(src as DirectoryID);
      await directory.id();
      return directory;
    } catch (_) {
      return client.host().directory(src);
    }
  }
  return src instanceof Directory ? src : client.host().directory(src);
};

export const getDatabaseUrl = async (
  client: Client,
  dbUrl?: string | Secret
) => {
  if (Deno.env.get("DATABASE_URL")) {
    return client.setSecret("DATABASE_URL", Deno.env.get("DATABASE_URL")!);
  }
  if (dbUrl && typeof dbUrl === "string") {
    try {
      const secret = client.loadSecretFromID(dbUrl as SecretID);
      await secret.id();
      return secret;
    } catch (_) {
      return client.setSecret("DATABASE_URL", dbUrl);
    }
  }
  if (dbUrl && dbUrl instanceof Secret) {
    return dbUrl;
  }
  return undefined;
};
