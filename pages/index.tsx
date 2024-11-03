import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import type { SpotifyPlaylist } from '../types/spotify';

export default function Home() {
  const { data: session, status } = useSession();
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (session?.accessToken) {
        try {
          setLoading(true);
          const response = await fetch('https://api.spotify.com/v1/me/playlists', {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch playlists');
          }

          const data = await response.json();
          setPlaylists(data.items);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPlaylists();
  }, [session]);

  if (status === 'loading') {
    return <div>Loading authentication status...</div>;
  }

  if (!session) {
    return (
      <div className="p-4">
        <button
          onClick={() => signIn()}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <span>Signed in as {session.user?.name}</span>
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Sign out
        </button>
      </div>

      {loading && <div>Loading playlists...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}

      <div className="grid grid-cols-1 gap-4 w-1/4">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="border p-4 rounded shadow hover:shadow-md transition-shadow"
          >
            {playlist.images[0] && (
              <img
                src={playlist.images[0].url}
                alt={`${playlist.name} cover`}
                className="w-full h-48 object-cover rounded mb-2"
              />
            )}
            <h3 className="font-bold">{playlist.name}</h3>
            <p className="text-gray-600">
              {playlist.tracks.total} tracks • By {playlist.owner.display_name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}