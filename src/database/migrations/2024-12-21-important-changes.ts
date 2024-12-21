import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("vot_translations")
    .alterColumn("id", (col) => col.dropDefault())
    .alterColumn("id", (col) => col.setDataType("bigint"))
    .alterColumn("created_at", (col) => col.setDataType("timestamptz"))
    .execute();

  await sql`DROP SEQUENCE public.vot_translations_id_seq CASCADE`.execute(db);

  await sql`ALTER TABLE vot_translations DROP CONSTRAINT IF EXISTS vot_translations_pkey`.execute(
    db,
  );
  await sql`ALTER TABLE vot_translations ALTER id ADD GENERATED ALWAYS AS IDENTITY`.execute(db);
  await sql`SELECT setval(pg_get_serial_sequence('vot_translations', 'id'), max(id)) FROM vot_translations;`.execute(
    db,
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("vot_translations")
    .alterColumn("id", (col) => col.setDataType("serial"))
    .alterColumn("created_at", (col) => col.setDataType("timestamp"))
    .execute();

  await sql`ALTER TABLE vot_translations ADD CONSTRAINT vot_translations_pkey PRIMARY KEY ("id");`.execute(
    db,
  );
}
