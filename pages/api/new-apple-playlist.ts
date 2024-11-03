import { searchAppleMusic } from "@/utils/applemusic";
import { NextApiRequest, NextApiResponse } from "next";

interface CreatePlaylistRequest {
  name: string;
  description?: string;
  tracksISRCs?: string[]; 
}

interface AppleMusicResponse {
  data: {
    id: string;
    attributes: {
      name: string;
      description?: string;
    };
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { name, description, tracksISRCs } =
      req.body as CreatePlaylistRequest;

    // Get your developer token
    const devToken = process.env.APPLE_MUSIC_DEV_TOKEN;

    // Get user's Music User Token (MUT) from your authentication system
    const musicUserToken = req.headers["music-user-token"];

    if (!devToken || !musicUserToken) {
      return res.status(401).json({ message: "Missing authentication tokens" });
    }

    const tracksAppleMusicIds = [];

    console.log("hrere");

    for (const isrc of tracksISRCs!) {
      if (isrc) {
        const appleMusicId = await searchAppleMusic(isrc, devToken);
        if (appleMusicId) {
          tracksAppleMusicIds.push(appleMusicId);
        }
      }
    }

    console.log("tracksAppleMusicIds", tracksAppleMusicIds);

    // Create playlist payload
    const payload = {
      attributes: {
        name,
        description: description || "",
      },
      relationships: {
        tracks: {
          data:
            tracksISRCs?.map((id) => ({
              id,
              type: "songs",
            })) || [],
        },
      },
    };

    // Make request to Apple Music API
    const response = await fetch(
      "https://api.music.apple.com/v1/me/library/playlists",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${devToken}`,
          "Music-User-Token": musicUserToken as string,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: [payload] }),
      }
    );

    if (!response.ok) {
      throw new Error(`Apple Music API error: ${response.statusText}`);
    }

    const data: AppleMusicResponse = await response.json();

    return res.status(201).json({
      playlistId: data.data[0].id,
      name: data.data[0].attributes.name,
    });
  } catch (error) {
    console.error("Error creating playlist:", error);
    return res.status(500).json({
      message: "Error creating playlist",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
