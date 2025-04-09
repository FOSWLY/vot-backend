import SubtitleCacheRepository, {
  subtitleRepository as subtitleCacheRepository,
} from "@/cache/repositories/subtitle";
import SubtitleDBRepository, {
  subtitleRepository as subtitleDBRepository,
} from "@/database/repositories/subtitle";
import {
  GetSubtitleOpts,
  MassDeleteSubtitleOpts,
  NewSubtitle,
  Subtitle,
  SubtitleUpdate,
} from "@/schemas/subtitle";
import BaseFacade from "@/facades/base";

export default class SubtitleFacade extends BaseFacade<
  SubtitleCacheRepository,
  SubtitleDBRepository
> {
  constructor() {
    super(subtitleCacheRepository, subtitleDBRepository);
  }

  async get(getBy: GetSubtitleOpts): Promise<Subtitle[]> {
    const cached = await this.cacheRepository.get(getBy);
    if (cached?.length) {
      return cached;
    }

    const results = await this.dbRepository.get(getBy);
    await Promise.allSettled(
      results.map(async (result) => await this.cacheRepository.create(result)),
    );

    return results;
  }

  async getById(id: number): Promise<Subtitle | undefined> {
    const cached = (await this.cacheRepository.getAll({ id }))?.[0];
    if (cached) {
      return cached;
    }

    const result = await this.dbRepository.getById(id);
    if (result) {
      await this.cacheRepository.create(result);
    }

    return result;
  }

  async getAll(criteria: Partial<Subtitle>, offset = 0, limit = 10): Promise<Subtitle[]> {
    // !!! not cached
    return await this.dbRepository.getAll(criteria, offset, limit);
  }

  async getTotal() {
    // !!! not cached
    return +((await this.dbRepository.getTotal())?.total ?? 0);
  }

  async update(id: number, updateWith: SubtitleUpdate): Promise<boolean> {
    await this.dbRepository.update(id, updateWith);
    const result = await this.dbRepository.getById(id);
    if (!result) {
      const cachedItem = (await this.cacheRepository.getAll({ id }))?.[0];
      if (cachedItem) {
        await this.cacheRepository.deleteById(cachedItem.service, cachedItem.id);
      }

      return false;
    }

    await this.cacheRepository.update(id, result);
    return true;
  }

  async create(subtitle: NewSubtitle): Promise<Subtitle | undefined> {
    const result = (await this.dbRepository.create(subtitle)) as Subtitle;
    if (!result) {
      return result;
    }

    await this.cacheRepository.create(result);
    return result;
  }

  async deleteById(id: number): Promise<Subtitle | undefined> {
    const result = await this.dbRepository.deleteById(id);
    if (!result) {
      return;
    }

    await this.cacheRepository.deleteById(result.service, id);
    return result;
  }

  async massDelete(criteria: Partial<MassDeleteSubtitleOpts>): Promise<Subtitle[] | undefined> {
    const results = (await this.dbRepository.massDelete(criteria)) as Subtitle[] | undefined;
    if (!results) {
      return;
    }

    await Promise.allSettled(
      results.map(
        async (result) => await this.cacheRepository.deleteById(result.service, result.id),
      ),
    );

    return results;
  }
}

export const subtitleFacade = new SubtitleFacade();
