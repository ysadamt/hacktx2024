import { getSession } from 'next-auth/react';
import { spotifyApi, getPlaylistIdFromUrl } from '../../utils/spotify';

export default async function handler(req, res) {
  try {
    const session = await getSession({ req });

    const { playlistUrl } = req.query; 
    const playlistId = getPlaylistId(playlistUrl);

    const allTracks = [];
    let url = `/playlists/${playlistId}/tracks`;
    
    while (url) {
      const response = await spotifyApi(url, session.accessToken);
      allTracks.push(...response.items);
      url = response.next ? response.next.replace('https://api.spotify.com/v1', '') : null;
    }

    const trackIds = allTracks.map(item => item.track.id);
    
    // getting the ISRC from the trackIDs
    const tracksWithDetails = await getTracksDetails(trackIds, session.accessToken);

    res.json({ tracks: tracksWithDetails });
  } catch (error) {
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.error || error.message 
    });
  }
}