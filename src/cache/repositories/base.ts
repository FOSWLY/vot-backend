import config from "../../config";

export default class BaseRepository {
  protected prefix: string;
  protected ttl: number | string;
  protected repositoryName = "base";

  constructor({ prefix, ttl } = config.redis) {
    this.prefix = prefix;
    this.ttl = ttl;
  }
}
