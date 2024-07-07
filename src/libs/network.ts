import config from "../config";

export async function fetchWithTimeout(
  url: string | URL | Request,
  options: Record<string, any> = {
    headers: {
      "User-Agent": config.downloaders.userAgent,
    },
  },
) {
  const { timeout = 3000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout as number);

  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
  });

  clearTimeout(id);

  return response;
}
