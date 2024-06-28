import config from "../../config";

export default class BaseRepository {
  protected prefix: string;
  protected ttl: number | string;

  constructor({ prefix, ttl } = config.redis) {
    this.prefix = prefix;
    this.ttl = ttl;
  }
}
