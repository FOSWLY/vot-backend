import config from "@/config";
import { log } from "@/logging";

export default class BaseRepository {
  protected prefix: string;
  protected ttl: number | string;
  protected repositoryName = "base";
  protected dateFields: string[] = [];

  constructor({ prefix, ttl } = config.redis) {
    this.prefix = prefix;
    this.ttl = ttl;
  }

  protected getKey(..._opts: any) {
    return `${this.prefix}:${this.repositoryName}`;
  }

  reviveJSON<T = unknown>(text: string): T;
  reviveJSON(text: null | undefined): undefined;
  reviveJSON<T = unknown>(text: string | null | undefined): T | undefined;
  reviveJSON<T = unknown>(text: string | null | undefined): T | undefined {
    if (!text) {
      return undefined;
    }

    try {
      return JSON.parse(text, (key: string, value: unknown) => {
        if (this.dateFields.includes(key)) {
          value = new Date(value as string | number);
        }

        return value;
      }) as T;
    } catch (err) {
      log.error(
        {
          text,
        },
        `Failed to revive JSON, because ${(err as Error).message}`,
      );
      return undefined;
    }
  }
}
