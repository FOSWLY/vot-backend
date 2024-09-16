import config from "../config";

export function validatePage(page: number | undefined) {
  if (!page || page < 0) {
    return 0;
  }

  return page > config.navigation.maxPage ? config.navigation.maxPage : Math.round(page);
}

export function validateLimit(limit: number | undefined) {
  if (!limit || limit < 0) {
    return config.navigation.defaultLimit;
  }

  return limit > config.navigation.maxLimit ? config.navigation.maxLimit : Math.round(limit);
}

export function calcNavigationOffset(page: number, limit: number) {
  if (page < 2) {
    return 0;
  }

  return limit * (page - 1);
}

export function validateNavigation(page: number | undefined, limit: number | undefined) {
  page = validatePage(page);
  limit = validateLimit(limit);
  const offset = calcNavigationOffset(page, limit);
  return {
    page,
    limit,
    offset,
  };
}

export function getNavigationData(page: number, totalItems: number, limit: number) {
  if (page === 0) {
    page = 1;
  }

  const pages = Math.ceil(totalItems / limit);
  const next = page < pages ? page + 1 : null;
  const prev = page > 1 ? (page > pages ? pages : page - 1) : null;
  return {
    page,
    pages,
    next,
    prev,
  };
}
