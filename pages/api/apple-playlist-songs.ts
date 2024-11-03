import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { playlistId } = req.query;
    const devToken = process.env.APPLE_MUSIC_DEV_TOKEN;
    const musicUserToken = req.headers['music-user-token'];

    if (!devToken || !musicUserToken) {
      return res.status(401).json({ message: 'Missing authentication tokens' });
    }

    // Fetch playlist tracks from Apple Music
    const response = await fetch(
      `https://api.music.apple.com/v1/me/library/playlists/${playlistId}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${devToken}`,
          'Music-User-Token': musicUserToken as string,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Apple Music API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract ISRCs from the tracks
    const trackISRCs = data.data.map((track: any) => ({
      isrc: track.attributes?.isrc || null,
      name: track.attributes?.name || 'Unknown Track',
      artist: track.attributes?.artistName || 'Unknown Artist'
    }));

    return res.status(200).json({ tracks: trackISRCs });
  } catch (error) {
    console.error('Error fetching Apple Music tracks:', error);
    return res.status(500).json({
      message: 'Error fetching playlist tracks',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}