import { Database } from "../schema";

export default class BaseRepository {
  constructor(protected dbName: keyof Database) {}
}
