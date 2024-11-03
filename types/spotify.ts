export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  href: string;
  tracks: {
    total: number;
    href: string;
  };
  images: Array<{
    url: string;
    height: number | null;
    width: number | null;
  }>;
  owner: {
    display_name: string;
    id: string;
  };
  public: boolean;
}

export interface SpotifyPlaylistsResponse {
  items: SpotifyPlaylist[];
  total: number;
  limit: number;
  offset: number;
  previous: string | null;
  next: string | null;
}
