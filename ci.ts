import {
  validate,
  push,
} from "https://pkg.fluentci.io/prisma_pipeline@v0.6.0/mod.ts";

// validate prisma schema and apply schema changes
await validate();
await push();
