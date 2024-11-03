// pages/api/playlists.ts
import { NextApiRequest, NextApiResponse } from "next";

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

    const playlistName = req.query.playlistName as string;
    const isrcArr = JSON.parse(req.query.isrcArr as string);

    console.log(isrcArr);

    if (!developerToken || !musicUserToken) {
      return res.status(401).json({ error: "Missing required tokens" });
    }

    const data = [];
    for (const isrc of isrcArr) {
      const response = await fetch(
        `https://api.music.apple.com/v1/catalog/us/songs?filter[isrc]=${isrc}`,
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
        continue;
      }
      const song = await response.json();
      data.push(song.data[0]);
    }

    const appleMusicSongIds = [];

    for (const song of data) {
      if (song) {
        appleMusicSongIds.push(song.id);
      }
    }

    // create a new playlist and add the songs to it
    const response2 = await fetch(
      "https://api.music.apple.com/v1/me/library/playlists",
      {
        method: "POST",
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
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          attributes: {
            name: playlistName,
            description: "",
          },
          relationships: {
            tracks: {
              data: appleMusicSongIds.map((id) => ({
                id,
                type: "songs",
              })),
            },
          },
        }),
      }
    );

    if (!response2.ok) {
      throw new Error(`Apple Music API error: ${response2.statusText}`);
    }

    const data2 = await response2.json();

    res.status(200).json({ playlistUrl: data2.data[0].href });
  } catch (error) {
    console.error("Error fetching playlists:", error);
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
}
