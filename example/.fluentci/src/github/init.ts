import { generateYaml } from "./config.ts";

generateYaml().save(".github/workflows/prisma-migrate.yml");
