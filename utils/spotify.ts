import axios from "axios";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export async function spotifyApi(endpoint: string, accessToken: string) {
  try {
    const response = await axios({
      url: `${SPOTIFY_API_BASE}${endpoint}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Spotify API Error:", error.response?.data || error.message);
    throw error;
  }
}

export function getPlaylistId(url: string) {
  // Handle different URL formats:
  // https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
  // https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=1234567890
  // spotify:playlist:37i9dQZF1DXcBWIGoYBM5M

  const matches = url.match(/playlist[:/]([a-zA-Z0-9]+)/);
  return matches ? matches[1] : null;
}

export async function getTracksDetails(
  trackIds: string[],
  accessToken: string
) {
  const batchSize = 50;
  const batches = [];

  for (let i = 0; i < trackIds.length; i += batchSize) {
    const batch = trackIds.slice(i, i + batchSize);
    batches.push(batch);
  }

  const allDetails = [];

  for (const batch of batches) {
    const ids = batch.join(",");
    const response = await spotifyApi(`/tracks?ids=${ids}`, accessToken);

    const details = response.tracks.map(
      (track: any) => track.external_ids?.isrc || ""
    );

    allDetails.push(...details);
  }

  console.log(allDetails);
  return allDetails;
}
