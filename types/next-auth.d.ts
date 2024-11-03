import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
    error?: string;
    provider?: string;
    appleDevToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
    provider?: string;
    appleDevToken?: string;
  }
}

// types/music.ts
export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
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

export interface AppleMusicPlaylist {
  id: string;
  attributes: {
    name: string;
    description?: string;
    artwork?: {
      url: string;
      width: number;
      height: number;
    };
    trackCount: number;
    curator?: {
      name: string;
    };
  };
}

export interface UnifiedPlaylist {
  id: string;
  name: string;
  description?: string;
  trackCount: number;
  imageUrl?: string;
  owner?: string;
  source: 'spotify' | 'apple';
}
