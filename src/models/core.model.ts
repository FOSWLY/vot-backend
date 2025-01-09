import Elysia, { Static, t } from "elysia";

import config from "@/config";

const {
  navigation: { maxPage },
} = config;

export const Page = t.Number({
  minimum: 1,
  maximum: maxPage,
});

export const Navigation = t.Object({
  page: Page,
  pages: Page,
  next: t.Nullable(Page),
  prev: t.Nullable(Page),
});

export type Navigation = Static<typeof Navigation>;

export const coreModels = new Elysia().model({
  "not-authenticated": t.Object({
    error: t.Literal("Not authenticated", {
      examples: ["Not authenticated"],
    }),
  }),
});
