import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("vot_translations")
    .alterColumn("id", (col) => col.setDataType("integer"))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("vot_translations")
    .alterColumn("id", (col) => col.setDataType("bigint"))
    .execute();
}
