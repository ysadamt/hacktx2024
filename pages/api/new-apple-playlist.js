import { getSession } from 'next-auth/react';
import { spotifyApi, getPlaylistIdFromUrl } from '../../utils/spotify';
import { generateAppleToken, searchAppleMusic, createApplePlaylist } from '../../utils/apple-music';

export default async function handler(req, res) {
  try {
    const session = await getSession({ req });

    const { playlistUrl, playlistName, musicUserToken } = req.body;

    // getting Spotify playlist tracks
    const playlistId = getPlaylistId(playlistUrl);
    let url = `/playlists/${playlistId}/tracks`;
    const allTracks = [];
    
    while (url) {
      const response = await spotifyApi(url, session.accessToken);
      allTracks.push(...response.items);
      url = response.next ? response.next.replace('https://api.spotify.com/v1', '') : null;
    }

    // generate Apple Music developer token
    const developerToken = generateAppleToken();

    // converting tracks to Apple Music
    const conversionResults = [];
    const appleMusicTrackIds = [];

    for (const item of allTracks) {
      const isrc = item.track.external_ids?.isrc;
      if (isrc) {
        const appleMusicId = await searchAppleMusic(isrc, developerToken);
        conversionResults.push({
          name: item.track.name,
          isrc,
          spotifyId: item.track.id,
          appleMusicId,
          success: !!appleMusicId
        });

        if (appleMusicId) {
          appleMusicTrackIds.push(appleMusicId);
        }
      }
    }

    // create Apple Music playlist
    const playlistResult = await createApplePlaylist(
      playlistName || 'Spotify Import',
      'Converted from Spotify',
      appleMusicTrackIds,
      developerToken,
      musicUserToken
    );

    res.json({
      success: true,
      playlistId: playlistResult.playlistId,
      totalTracks: allTracks.length,
      convertedTracks: appleMusicTrackIds.length,
      conversionResults
    });

  } catch (error) {
    console.error('Playlist conversion error:', error);
    res.status(500).json({
      error: error.message,
      details: error.response?.data
    });
  }
}