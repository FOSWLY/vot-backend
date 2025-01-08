import Elysia, { t } from "elysia";

import config from "@/config";

const {
  app: { version },
} = config;

export const healthModels = new Elysia().model({
  health: t.Object({
    version: t.Literal(version, { examples: [version] }),
    status: t.Literal("ok", { examples: ["ok"] }),
  }),
});
