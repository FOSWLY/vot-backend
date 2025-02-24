import config from "@/config";
import { TranslatedService, translatedServices } from "@/types/translation";
import { GetSubtitleOpts, Subtitle, SubtitleUpdate } from "@/schemas/subtitle";
import { cache } from "@/cache/cache";
import BaseRepository from "./base";

export default class SubtitleRepository extends BaseRepository {
  repositoryName = "subtitle";
  dateFields = ["created_at"];

  getKey(service: TranslatedService) {
    return `${this.prefix}:${this.repositoryName}:${service}`;
  }

  async get({ service, video_id, provider }: GetSubtitleOpts): Promise<undefined | Subtitle[]> {
    return await this.getAll({
      service,
      video_id,
      provider,
    });
  }

  async getAll(
    criteria: Partial<Subtitle> = {},
    offset = 0,
    limit = config.navigation.defaultLimit,
  ) {
    let services: TranslatedService[] = translatedServices as unknown as TranslatedService[];
    if (criteria.service) {
      services = services.filter((service) => service === criteria.service);
    }

    const cachedResults = await Promise.all(
      services.map((service) => cache.hgetall(this.getKey(service))),
    );

    let result = cachedResults.reduce<Subtitle[]>((result, cached) => {
      const subtitles: Subtitle[] = Object.values(cached)
        .map((value) => {
          const data = this.reviveJSON<Subtitle>(value);
          if (
            (criteria.id && data.id !== criteria.id) ??
            (criteria.video_id && data.video_id !== criteria.video_id) ??
            (criteria.lang && data.lang !== criteria.lang) ??
            (criteria.lang_from && data.lang_from !== criteria.lang_from) ??
            (criteria.provider && data.provider !== criteria.provider) ??
            (criteria.subtitle_url && data.subtitle_url !== criteria.subtitle_url) ??
            (criteria.created_at && data.created_at !== criteria.created_at)
          ) {
            return false;
          }

          return data;
        })
        .filter((value) => value !== false);

      if (subtitles) {
        result.push(...subtitles);
      }

      return result;
    }, []);

    if (offset > 0) {
      result = result.slice(offset);
    }

    if (limit > 0) {
      result = result.slice(0, offset + limit);
    }

    return result;
  }

  async update(id: number, updateWith: SubtitleUpdate) {
    const res = (await this.getAll({ id }))?.[0];
    if (!res) {
      return;
    }

    await this.create({
      ...res,
      ...updateWith,
    });
  }

  async create(subtitle: Subtitle) {
    const hashKey = this.getKey(subtitle.service);
    await cache.hset(hashKey, {
      [String(subtitle.id)]: JSON.stringify(subtitle),
    });
    await cache.expire(hashKey, this.ttl);
  }

  async deleteById(service: TranslatedService, id: number) {
    return await cache.hdel(this.getKey(service), String(id));
  }
}
