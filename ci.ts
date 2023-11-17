import {
  validate,
  push,
} from "https://pkg.fluentci.io/prisma_pipeline@v0.5.0/mod.ts";

// validate prisma schema and apply schema changes
await validate();
await push();
