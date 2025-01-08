import { Elysia } from "elysia";

import config from "@/config";
import { healthModels } from "@/models/health.model";

export default new Elysia().group("/health", (app) =>
  app.use(healthModels).get(
    "/",
    () => ({
      version: config.app.version,
      status: "ok" as const,
    }),
    {
      response: "health",
      detail: {
        summary: "Get health",
        tags: ["Health"],
      },
    },
  ),
);
