import {
  queryType,
  makeSchema,
  dirname,
  join,
  resolve,
  stringArg,
  nonNull,
} from "../../deps.ts";

import { validate, deploy, push } from "./jobs.ts";

const Query = queryType({
  definition(t) {
    t.string("validate", {
      args: {
        src: nonNull(stringArg()),
        databaseUrl: nonNull(stringArg()),
      },
      resolve: async (_root, args, _ctx) =>
        await validate(args.src, args.databaseUrl),
    });
    t.string("deploy", {
      args: {
        src: nonNull(stringArg()),
        databaseUrl: nonNull(stringArg()),
      },
      resolve: async (_root, args, _ctx) =>
        await deploy(args.src, args.databaseUrl),
    });
    t.string("push", {
      args: {
        src: nonNull(stringArg()),
        databaseUrl: nonNull(stringArg()),
      },
      resolve: async (_root, args, _ctx) =>
        await push(args.src, args.databaseUrl),
    });
  },
});

export const schema = makeSchema({
  types: [Query],
  outputs: {
    schema: resolve(join(dirname(".."), dirname(".."), "schema.graphql")),
    typegen: resolve(join(dirname(".."), dirname(".."), "gen", "nexus.ts")),
  },
});
