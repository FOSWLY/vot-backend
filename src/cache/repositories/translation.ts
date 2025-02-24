import config from "@/config";
import { GetTranslationOpts, Translation, TranslationUpdate } from "@/schemas/translation";
import { TranslatedService, translatedServices } from "@/types/translation";
import type { TranslationProvider } from "@/models/shared.model";
import { cache } from "@/cache/cache";
import BaseRepository from "./base";

export default class TranslationRepository extends BaseRepository {
  repositoryName = "translation";
  dateFields = ["created_at"];

  private getField(
    video_id: string,
    provider: TranslationProvider,
    lang_from: string,
    lang_to: string,
  ) {
    return `${video_id}:${provider}:${lang_from}:${lang_to}`;
  }

  getKey(service: TranslatedService) {
    return `${this.prefix}:${this.repositoryName}:${service}`;
  }

  async get({
    service,
    video_id,
    provider,
    lang_from,
    lang_to,
  }: GetTranslationOpts): Promise<undefined | Translation> {
    const result = await cache.hget(
      this.getKey(service),
      this.getField(video_id, provider, lang_from, lang_to),
    );

    return this.reviveJSON<Translation>(result);
  }

  async getAll(
    criteria: Partial<Translation> = {},
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

    let result = cachedResults.reduce((result, cached) => {
      const translations: Translation[] = Object.values(cached)
        .map((value) => {
          const data = this.reviveJSON<Translation>(value);
          if (
            (criteria.id && data.id !== criteria.id) ??
            (criteria.video_id && data.video_id !== criteria.video_id) ??
            (criteria.status && data.status !== criteria.status) ??
            (criteria.provider && data.provider !== criteria.provider) ??
            (criteria.translated_url && data.translated_url !== criteria.translated_url) ??
            (criteria.created_at && data.created_at !== criteria.created_at)
          ) {
            return false;
          }

          return data;
        })
        .filter((value) => value !== false);

      if (translations) {
        result.push(...translations);
      }

      return result;
    }, [] as Translation[]);

    if (offset > 0) {
      result = result.slice(offset);
    }

    if (limit > 0) {
      result = result.slice(0, offset + limit);
    }

    return result;
  }

  async update(getBy: GetTranslationOpts, updateWith: TranslationUpdate) {
    const res = await this.get(getBy);
    if (!res) {
      return;
    }

    await this.create({
      ...res,
      ...updateWith,
    });
  }

  async create(translation: Translation) {
    const { service, video_id, provider, lang_from, lang_to } = translation;
    const hashKey = this.getKey(service);
    await cache.hset(hashKey, {
      [this.getField(video_id, provider, lang_from, lang_to)]: JSON.stringify(translation),
    });
    await cache.expire(hashKey, this.ttl);
  }

  async delete({ service, video_id, provider, lang_from, lang_to }: GetTranslationOpts) {
    return await cache.hdel(
      this.getKey(service),
      this.getField(video_id, provider, lang_from, lang_to),
    );
  }
}
