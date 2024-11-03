export interface AppleMusicPlaylist {
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

export interface AppleMusicResponse {
  data: AppleMusicPlaylist[];
  meta: {
    total: number;
  };
}

export const fetchUserPlaylists = async (
  limit: number = 25,
  offset: number = 0
): Promise<AppleMusicResponse> => {
  try {
    const response = await fetch(
      `https://api.music.apple.com/v1/me/library/playlists?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.APPLE_MUSIC_AUTHORIZATION!}`,
          "Music-User-Token": process.env.APPLE_MUSIC_MEDIA_USER_TOKEN!,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Apple Music API error: ${response.status}`);
    }

    const data: AppleMusicResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Apple Music playlists:", error);
    throw error;
  }
};
