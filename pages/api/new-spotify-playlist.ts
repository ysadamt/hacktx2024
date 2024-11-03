import { getSession } from 'next-auth/react';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session?.accessToken) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { name, description, tracks } = req.body;

    // 1. Create empty playlist
    const createPlaylistResponse = await fetch(
      `https://api.spotify.com/v1/me/playlists`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          public: false,
        }),
      }
    );

    if (!createPlaylistResponse.ok) {
      throw new Error('Failed to create Spotify playlist');
    }

    const playlist = await createPlaylistResponse.json();

    // 2. Search for tracks by ISRC and get Spotify IDs
    const spotifyTrackIds = [];
    for (const track of tracks) {
      if (track.isrc) {
        const searchResponse = await fetch(
          `https://api.spotify.com/v1/search?q=isrc:${track.isrc}&type=track`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.tracks.items.length > 0) {
            spotifyTrackIds.push(searchData.tracks.items[0].uri);
          }
        }
      }
    }

    // 3. Add tracks to playlist
    if (spotifyTrackIds.length > 0) {
      const addTracksResponse = await fetch(
        `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uris: spotifyTrackIds,
          }),
        }
      );

      if (!addTracksResponse.ok) {
        throw new Error('Failed to add tracks to playlist');
      }
    }

    return res.status(201).json({
      playlistId: playlist.id,
      name: playlist.name,
      trackCount: spotifyTrackIds.length,
    });
  } catch (error) {
    console.error('Error creating Spotify playlist:', error);
    return res.status(500).json({
      message: 'Error creating playlist',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}