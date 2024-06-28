export default class BaseFacade<C, D> {
  constructor(
    protected cacheRepository: C,
    protected dbRepository: D,
  ) {}
}
