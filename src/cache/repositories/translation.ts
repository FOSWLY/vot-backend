import { GetTranslationOpts, Translation, TranslationUpdate } from "../../schemas/translation";
import {
  TranslatedService,
  translatedServices,
  TranslationProvider,
} from "../../types/translation";
import { cache } from "../cache";
import BaseRepository from "./base";

export default class TranslationRepository extends BaseRepository {
  repositoryName = "translation";

  private getField(
    video_id: string,
    provider: TranslationProvider,
    lang_from: string,
    lang_to: string,
  ) {
    return `${video_id}:${provider}:${lang_from}:${lang_to}`;
  }

  private getKey(service: TranslatedService) {
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

    return result ? (JSON.parse(result) as Translation) : undefined;
  }

  async getAll(criteria: Partial<Translation> = {}) {
    let services: TranslatedService[] = translatedServices as unknown as TranslatedService[];
    if (criteria.service) {
      services = services.filter((service) => service === criteria.service);
    }

    const result = [];
    for await (const service of services) {
      const cached = await cache.hgetall(this.getKey(service));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const [_, val] of Object.entries(cached)) {
        const data = JSON.parse(val) as Translation;
        if (
          (criteria.id && data.id !== criteria.id) ??
          (criteria.video_id && data.video_id !== criteria.video_id) ??
          (criteria.status && data.status !== criteria.status) ??
          (criteria.provider && data.provider !== criteria.provider) ??
          (criteria.translated_url && data.translated_url !== criteria.translated_url) ??
          (criteria.created_at && data.created_at !== criteria.created_at)
        ) {
          continue;
        }

        result.push(data);
      }
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
