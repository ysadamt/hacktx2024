import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import type { SpotifyPlaylist } from "../types/spotify";
import { getMusicUserToken } from "@/utils/appleMusicAuth";
import Image from "next/image";
import logo from "@/public/assets/logo.png";
import playIcon from "@/public/assets/play-icon.svg";
import topLeft from "@/public/assets/top-left.svg";
import bottomRight from "@/public/assets/bottom-right.svg";
import gridBg from "@/public/assets/grid-bg.png";
import sparkle from "@/public/assets/sparkle.svg";
import lines from "@/public/assets/lines.svg";
import jpWords from "@/public/assets/jp-words.svg";
import { VT323 } from "next/font/google";
import ForegroundStatic from "@/components/ForegroundStatic";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
});

export default function Home() {
  const { data: session, status } = useSession();
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [convertingPlaylistId, setConvertingPlaylistId] = useState<
    string | null
  >(null);
  const [conversionSuccess, setConversionSuccess] = useState<string | null>(
    null
  );

  async function fetchPlaylistDetails(playlist: SpotifyPlaylist) {
    try {
      setConvertingPlaylistId(playlist.id);
      setError(null);
      setConversionSuccess(null);

      // 1. Get tracks from Spotify playlist
      const response = await fetch(
        `/api/spotify-playlist-songs?playlistId=${playlist.id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch playlist details");
      }
      const { tracks: trackISRCs } = await response.json();

      // 2. Get Apple Music authentication
      const devToken = process.env.NEXT_PUBLIC_APPLE_MUSIC_DEV_TOKEN;
      if (!devToken) {
        throw new Error("Apple Music developer token not configured");
      }

      const musicUserToken = await getMusicUserToken(devToken);
      if (!musicUserToken) {
        throw new Error(
          "Failed to get Apple Music authorization. Please make sure you're signed in to Apple Music."
        );
      }

      // 3. Create Apple Music playlist
      const createPlaylistResponse = await fetch("/api/new-apple-playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Music-User-Token": musicUserToken,
        },
        body: JSON.stringify({
          name: `${playlist.name} (from Spotify)`,
          description: playlist.description || "Playlist imported from Spotify",
          tracksISRCs: trackISRCs.filter(Boolean),
        }),
      });

      if (!createPlaylistResponse.ok) {
        throw new Error("Failed to create Apple Music playlist");
      }

      const result = await createPlaylistResponse.json();
      setConversionSuccess(
        `Successfully created "${playlist.name}" in Apple Music!`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error(err);
    } finally {
      setConvertingPlaylistId(null);
    }
  }

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (session?.accessToken) {
        try {
          setLoading(true);
          const response = await fetch(
            "https://api.spotify.com/v1/me/playlists",
            {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch playlists");
          }

          const data = await response.json();
          setPlaylists(data.items);
        } catch (err) {
          setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPlaylists();
  }, [session]);

  if (status === "loading") {
    return <div>Loading authentication status...</div>;
  }

  if (!session) {
    return (
      <div
        className={`${vt323.className} p-4 flex flex-col items-center justify-center min-h-dvh gap-8 text-white relative`}
      >
        <Image
          src={gridBg}
          alt="Grid"
          className="absolute bottom-0 left-0 w-full"
        />
        <div className="absolute bg-random-dots bg-repeat top-0 right-0 w-full h-full" />
        <Image
          src={sparkle}
          alt="Sparkle"
          className="absolute top-[5%] left-[5%] w-[6%] sm:w-[3%]"
        />
        <Image
          src={sparkle}
          alt="Sparkle"
          className="absolute bottom-[5%] right-[5%] w-[6%] sm:w-[3%]"
        />
        <Image
          src={lines}
          alt="Lines"
          className="absolute top-[6%] right-[5%] w-[15%] sm:w-[10%]"
        />
        <Image
          src={jpWords}
          alt="JP Words"
          className="absolute top-[12%] sm:top-[18%] right-[5%] w-[16%] sm:w-[7%]"
        />
        <div className="relative w-[95%] sm:w-[60%]">
          <Image src={logo} alt="Bridge" className="w-full" />
          <Image
            src={topLeft}
            alt="top left"
            className="absolute top-0 left-0 w-[14%]"
          />
          <Image
            src={bottomRight}
            alt="bottom right"
            className="absolute bottom-0 right-0 w-[14%]"
          />
        </div>
        <div className="flex gap-4 z-[9999]">
          <Image src={playIcon} alt="Play" className="w-8" />
          <button
            onClick={() => signIn()}
            className="text-2xl px-6 py-2 border-2 border-white hover:bg-white hover:text-black"
          >
            Sign in
          </button>
        </div>
        <p className="absolute bottom-8 text-lg">
          © 2024 DEVLOG Design, inc. ALL RIGHTS RESERVED
        </p>
        <ForegroundStatic />
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
            onClick={() => fetchPlaylistDetails(playlist)}
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
