import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("vot_translations")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("service", "varchar", (col) => col.notNull())
    .addColumn("video_id", "varchar", (col) => col.notNull())
    .addColumn("status", "varchar", (col) => col.notNull())
    .addColumn("provider", "varchar", (col) => col.notNull())
    .addColumn("lang_from", "varchar", (col) => col.notNull())
    .addColumn("lang_to", "varchar", (col) => col.notNull())
    .addColumn("message", "varchar")
    .addColumn("remaining_time", "integer")
    .addColumn("translated_url", "varchar")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("vot_translations").execute();
}
