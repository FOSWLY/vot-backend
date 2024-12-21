import { Database } from "@/database/schema";

export default class BaseRepository {
  constructor(protected dbName: keyof Database) {}
}
