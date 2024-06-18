import config from "../config";

const bannedChars = [...config.downloaders.bannedChars, "."];

export function normalizeVideoId(videoId: string | number): string {
  videoId = videoId.toString();

  for (const banned of bannedChars) {
    videoId = videoId.replaceAll(banned, "");
  }

  return videoId;
}
