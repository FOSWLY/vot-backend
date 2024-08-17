import { PlaylistResponse } from "../../types/videoExtrator/helper/epicgames";
import { fetchWithTimeout } from "../../libs/network";
import { log } from "../../logging";

export async function getPlaylist(url: string) {
  try {
    const res = await fetchWithTimeout(url);
    const result = (await res.json()) as PlaylistResponse;
    return result.playlist;
  } catch (err: unknown) {
    log.error(
      {
        msg: (err as Error)?.message,
        url,
      },
      "Failed to get EpicGames Playlist",
    );
    return "";
  }
}
