import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";

import config from "../config";
import { Database } from "./schema";
import { log } from "../setup";

const dialect = new PostgresDialect({
  pool: new Pool({
    database: config.db.name,
    user: config.db.user,
    password: config.db.password,
    host: config.db.host,
    port: config.db.port,
    max: 10,
  }),
});

export const db = new Kysely<Database>({
  dialect,
  log(event) {
    if (event.level === "error") {
      log.error("Query failed : ", {
        durationMs: event.queryDurationMillis,
        error: event.error,
        sql: event.query.sql,
        params: event.query.parameters,
      });
    } else {
      // `'query'`
      log.debug("Query executed : ", {
        durationMs: event.queryDurationMillis,
        sql: event.query.sql,
        params: event.query.parameters,
      });
    }
  },
});
