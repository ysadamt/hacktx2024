import { getSession } from "next-auth/react";
import {
  spotifyApi,
  getPlaylistId,
  getTracksDetails,
} from "../../utils/spotify";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ tracks: any[] } | { error: string }>
) {
  try {
    const session = await getSession({ req });

    const { playlistId } = req.query;
    console.log(playlistId);

    const allTracks = [];
    let url = `/playlists/${playlistId}/tracks`;

    while (url) {
      const response = await spotifyApi(url, session!.accessToken!);
      allTracks.push(...response.items);
      url = response.next
        ? response.next.replace("https://api.spotify.com/v1", "")
        : null;
    }

    const trackIds = allTracks.map((item) => item.track.id);

    // getting the ISRC from the trackIDs
    const tracksWithDetails = await getTracksDetails(
      trackIds,
      session!.accessToken!
    );

    res.json({ tracks: tracksWithDetails });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || error.message,
    });
  }
}
