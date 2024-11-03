// pages/api/playlists.ts
import { NextApiRequest, NextApiResponse } from 'next';

interface AppleMusicPlaylist {
  id: string;
  type: string;
  href: string;
  attributes: {
    name: string;
    description?: string;
    artwork?: {
      url: string;
      width: number;
      height: number;
    };
    playParams: {
      id: string;
      kind: string;
    };
    trackCount: number;
  };
}

interface AppleMusicResponse {
  data: AppleMusicPlaylist[];
  meta: {
    total: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const developerToken = process.env.APPLE_DEVELOPER_TOKEN;
    const musicUserToken = req.cookies['music-user-token']; // Get from cookies

    if (!developerToken || !musicUserToken) {
      return res.status(401).json({ error: 'Missing required tokens' });
    }

    const response = await fetch(
      'https://api.music.apple.com/v1/me/library/playlists?limit=25',
      {
        headers: {
          'Authorization': `Bearer ${developerToken}`,
          'Music-User-Token': musicUserToken,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Apple Music API error: ${response.status}`);
    }

    const data: AppleMusicResponse = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
}
