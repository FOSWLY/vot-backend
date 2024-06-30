import * as path from "path";
import { promises as fs } from "fs";
import { Migrator, FileMigrationProvider } from "kysely";

import { db } from "./database";
import { log } from "../logging";

const action = Bun.env.MIGRATOR_ACTION ?? "upgrade";

async function migrate() {
  log.info("Starting migration...");
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder: path.join(__dirname, "migrations"),
    }),
  });

  const { error, results } =
    action === "upgrade" ? await migrator.migrateToLatest() : await migrator.migrateDown();

  results?.forEach((it) => {
    if (it.status === "Success") {
      log.info(
        `Migration "${it.migrationName}" was ${action === "upgrade" ? "executed" : "downgraded"} successfully`,
      );
    } else if (it.status === "Error") {
      log.error(`Failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    log.error("Failed to migrate");
    log.error(error);
    process.exit(1);
  }

  await db.destroy();
}

migrate();
