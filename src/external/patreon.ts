import { fetchWithTimeout } from "../libs/network";

export default class PatreonAPI {
  static async getPosts(videoId: string | number) {
    try {
      const res = await fetchWithTimeout(`https://www.patreon.com/api/posts/${videoId}`);

      return await res.json();
    } catch (err) {
      console.error(`Failed to get patreon posts by videoId: ${videoId}.`, err);
      return null;
    }
  }
}
