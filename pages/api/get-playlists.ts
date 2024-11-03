// pages/api/playlists.ts
import { NextApiRequest, NextApiResponse } from "next";

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
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const developerToken = process.env.APPLE_MUSIC_AUTHORIZATION!;
    const musicUserToken = process.env.APPLE_MUSIC_MEDIA_USER_TOKEN!;
    const cookies = process.env.APPLE_MUSIC_COOKIES!;

    if (!developerToken || !musicUserToken) {
      return res.status(401).json({ error: "Missing required tokens" });
    }

    const response = await fetch(
      "https://api.music.apple.com/v1/me/library/playlists?limit=25",
      {
        headers: {
          Authorization: `Bearer ${developerToken}`,
          "Music-User-Token": musicUserToken,
          Cookie: unescape(encodeURIComponent(cookies)),
          Host: "amp-api.music.apple.com",
          "Accept-Encoding": "gzip, deflate, br",
          Referer: "https://music.apple.com/",
          Origin: "https://music.apple.com",
          Connection: "keep-alive",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-site",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Apple Music API error: ${response.status}`);
    }

    const data: AppleMusicResponse = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching playlists:", error);
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
}
