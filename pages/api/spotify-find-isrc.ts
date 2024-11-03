// pages/api/playlists.ts
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const artistName = req.query.artistName as string;
  const songName = req.query.songName as string;
  const accessToken = req.query.accessToken as string;

  try {
    const formattedArtistName = artistName.split(" ").join("%2520");
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=remaster%2520track%3A${songName}%2520artist%3A${formattedArtistName}&type=track&limit=1`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      res.status(200).json(data.tracks.items[0].external_ids.isrc); // returns isrc
    } else {
      const errorData = await response.json();
      console.error(
        "Failed to fetch song IRSC :",
        response.status,
        response.statusText,
        errorData
      );
    }
  } catch (error) {
    console.error("Error fetching ISRCs:", error);
    res.status(500).json({ error: "Failed to fetch ISRCs" });
  }
}
