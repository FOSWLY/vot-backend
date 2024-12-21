import TranslationCacheRepository from "@/cache/repositories/translation";
import TranslationDBRepository from "@/database/repositories/translation";
import {
  GetTranslationOpts,
  NewTranslation,
  Translation,
  TranslationUpdate,
} from "@/schemas/translation";
import BaseFacade from "@/facades/base";

export default class TranslationFacade extends BaseFacade<
  TranslationCacheRepository,
  TranslationDBRepository
> {
  constructor() {
    super(new TranslationCacheRepository(), new TranslationDBRepository());
  }

  async get(getBy: GetTranslationOpts): Promise<Translation | undefined> {
    const cached = await this.cacheRepository.get(getBy);
    if (cached) {
      return cached;
    }

    const result = (await this.dbRepository.get(getBy)) as Translation | undefined;
    if (result) {
      await this.cacheRepository.create(result);
    }

    return result;
  }

  async getById(id: number): Promise<Translation | undefined> {
    const cached = (await this.cacheRepository.getAll({ id }))?.[0];
    if (cached) {
      return cached;
    }

    const result = (await this.dbRepository.getById(id)) as Translation | undefined;
    if (result) {
      await this.cacheRepository.create(result);
    }

    return result;
  }

  async getAll(criteria: Partial<Translation>, offset = 0, limit = 10): Promise<Translation[]> {
    // !!! not cached
    // const cached = await this.cacheRepository.getAll(criteria, offset, limit);
    // if (cached.length) {
    //   return cached;
    // }

    return (await this.dbRepository.getAll(criteria, offset, limit)) as Translation[];
  }

  async getTotal() {
    // !!! not cached
    return +((await this.dbRepository.getTotal())?.total ?? 0);
  }

  async update(getBy: GetTranslationOpts, updateWith: TranslationUpdate): Promise<boolean> {
    await this.dbRepository.update(getBy, updateWith);
    const result = await this.dbRepository.get({
      service: updateWith.service ?? getBy.service,
      video_id: updateWith.video_id ?? getBy.video_id,
      provider: updateWith.provider ?? getBy.provider,
      lang_from: updateWith.lang_from ?? getBy.lang_from,
      lang_to: updateWith.lang_to ?? getBy.lang_to,
    });
    if (!result) {
      await this.cacheRepository.delete(getBy);
      return false;
    }

    await this.cacheRepository.update(getBy, result);
    return true;
  }

  async create(translation: NewTranslation): Promise<Translation | undefined> {
    const result = await this.dbRepository.create(translation);
    if (!result) {
      return result;
    }

    await this.cacheRepository.create(result as Translation);
    return result as Translation;
  }

  async delete(getBy: GetTranslationOpts): Promise<Translation | undefined> {
    const result = await this.dbRepository.delete(getBy);
    await this.cacheRepository.delete(getBy);

    return result as Translation | undefined;
  }

  async deleteById(id: number): Promise<Translation | undefined> {
    const result = await this.dbRepository.deleteById(id);
    if (!result) {
      return;
    }

    const { service, video_id, provider, lang_from, lang_to } = result as Translation;
    await this.cacheRepository.delete({
      service,
      video_id,
      provider,
      lang_from,
      lang_to,
    });

    return result as Translation | undefined;
  }
}
