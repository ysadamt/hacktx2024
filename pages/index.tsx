import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import type { SpotifyPlaylist } from "../types/spotify";
// import { getMusicUserToken } from '@/utils/appleMusicAuth';
import Image from "next/image";
import logo from "@/public/assets/logo.png";
import playIcon from "@/public/assets/play-icon.svg";
import topLeft from "@/public/assets/top-left.svg";
import bottomRight from "@/public/assets/bottom-right.svg";
import gridBg from "@/public/assets/grid-bg.png";
import sparkle from "@/public/assets/sparkle.svg";
import lines from "@/public/assets/lines.svg";
import jpWords from "@/public/assets/jp-words.svg";
import header from "@/public/assets/header.png";
import { VT323 } from "next/font/google";
import ForegroundStatic from "@/components/ForegroundStatic";
import CartridgeCarousel from "@/components/CartridgeCarousel";
import { EmblaOptionsType } from "embla-carousel";
import loadingImg from "@/public/assets/loading.png";
import { LuSparkles } from "react-icons/lu";
import Link from "next/link";
import SongsComponent from "@/components/SongsComponent";
import { useAppleMusicPlaylists } from "@/hooks/useAppleMusicPlaylists";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
});

const OPTIONS: EmblaOptionsType = { loop: true };

export default function Home() {
  const { data: session, status } = useSession();
  const { playlists: appleMusicPlaylists } = useAppleMusicPlaylists();
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [convertLoading, setConvertLoading] = useState(false);
  const [convertError, setConvertError] = useState("");
  const [convertSuccess, setConvertSuccess] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  const parsePlaylistUrl = (url: string) => {
    try {
      if (url.includes("spotify.com")) {
        const playlistId = url.split("playlist/")[1]?.split("?")[0];
        return { service: "spotify", id: playlistId };
      } else if (url.includes("music.apple.com")) {
        const playlistId = url.split("playlist/")[1]?.split("?")[0];
        return { service: "apple", id: playlistId };
      }
      throw new Error("Invalid playlist URL");
    } catch (err) {
      console.error(err);
      throw new Error("Unable to parse playlist URL");
    }
  };

  const handleConvert = async () => {
    try {
      setConvertLoading(true);
      setConvertError("");
      setConvertSuccess("");

      const { service, id } = parsePlaylistUrl(playlistUrl);

      if (service === "spotify") {
        // Get Spotify playlist tracks
        const tracksResponse = await fetch(
          `/api/spotify-playlist-songs?playlistId=${id}`
        );
        if (!tracksResponse.ok)
          throw new Error("Failed to fetch Spotify tracks");
        const { tracks } = await tracksResponse.json();

        // Create Apple Music playlist
        const createResponse = await fetch("/api/new-apple-playlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "Converted from Spotify",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tracksISRCs: tracks.map((track: any) => track.isrc),
          }),
        });

        if (!createResponse.ok)
          throw new Error("Spotify -> Apple Music failed");
        const result = await createResponse.json();
        setConvertSuccess(
          `Playlist created successfully! ID: ${result.playlistId}`
        );
      } else if (service === "apple") {
        // Get Apple Music playlist tracks
        const tracksResponse = await fetch(
          `/api/apple-playlist-songs?playlistId=${id}`
        );
        if (!tracksResponse.ok)
          throw new Error("Failed to fetch Apple Music tracks");
        const { tracks } = await tracksResponse.json();

        // Create Spotify playlist
        const createResponse = await fetch("/api/new-spotify-playlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            name: "Converted from Apple Music",
            tracks: tracks,
          }),
        });

        if (!createResponse.ok)
          throw new Error("Apple Music -> Spotify failed");
        const result = await createResponse.json();
        setConvertSuccess(
          `Playlist created successfully! ${result.trackCount} tracks added`
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setConvertError(err.message || "An error occurred during conversion");
    } finally {
      setConvertLoading(false);
    }
  };
  const [currentPlaylist, setCurrentPlaylist] = useState<number>(0);

  useEffect(() => {
    console.log(appleMusicPlaylists);
  }, [appleMusicPlaylists]);

  // async function fetchPlaylistDetails(playlistId: string) {
  //   try {
  //     const response = await fetch(`/api/spotify-playlist-songs?playlistId=${playlistId}`);
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch playlist details');
  //     }

  //     const trackISRCs = await response.json();
  //     console.log(trackISRCs);

  //     const userToken = await getMusicUserToken(session!.accessToken!);
  //     console.log(userToken);

  //     const response3 = await fetch(`/api/new-apple-playlist`,
  //       {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${session!.accessToken}`,
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(trackISRCs),
  //       }
  //     );
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }

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

  useEffect(() => {
    console.log(appleMusicPlaylists);
  }, [appleMusicPlaylists]);

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
    <div
      className={`${vt323.className} p-4 flex flex-col items-center justify-center min-h-dvh text-white relative`}
    >
      <div className="bg-[#242135] w-full flex justify-center p-4">
        <Image src={header} alt="Header" />
      </div>
      <div className="w-full">
        <div className="flex items-center justify-between px-8 pb-4 bg-[#242135]">
          <p className="text-2xl">Welcome back, {session.user?.name}!</p>
          <button
            onClick={() => signOut()}
            className="border-white text-white px-4 py-2 border-2 hover:bg-white hover:text-black text-lg"
          >
            Sign out
          </button>
        </div>
      </div>
      <div className="mt-8 flex justify-center items-center">
        {loading && <Image src={loadingImg} alt="Loading" />}
        {error && <div className="text-red-500">Error: {error}</div>}
        {playlists.length !== 0 && (
          <CartridgeCarousel
            currentPlaylist={currentPlaylist}
            setCurrentPlaylist={setCurrentPlaylist}
            slides={playlists}
            options={OPTIONS}
          />
        )}
      </div>

      <div>

      </div>

      {playlists.length !== 0 && (
        <div className="flex flex-col w-full items-center pt-16 gap-4">
          <h3 className="text-5xl w-3/4 text-center">Tracks</h3>
          <SongsComponent playlistHref={playlists[currentPlaylist].href} />
        </div>
      )}

      {/* <div className="grid grid-cols-1 gap-4 w-1/4">
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
      </div> */}
      <div className="flex gap-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2 border-2 border-[#EE98FF] flex items-center justify-center gap-4 text-4xl text-[#EE98FF] my-16 hover:bg-[#EE98FF] hover:text-black"
        >
          <svg
            width="37"
            height="40"
            viewBox="0 0 37 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.5 7.29419H30.5V32.706H18.5V20.0001H27.5V13.6471H15.5V32.706H3.5V20.0001H12.5V7.29419ZM12.5 23.1765H6.5V29.5295H12.5V23.1765ZM27.5 23.1765H21.5V29.5295H27.5V23.1765Z"
              fill="currentColor"
            />
          </svg>
          Convert
        </button>
        <Link
          href="/recommender"
          className="px-6 py-2 border-2 border-[#EE98FF] flex items-center justify-center gap-4 text-4xl text-[#EE98FF] my-16 hover:bg-[#EE98FF] hover:text-black"
        >
          <LuSparkles size={30} />
          Recommender
        </Link>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#242135] p-6 rounded-lg border-2 border-[#EE98FF] max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl text-white">Convert Playlist</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:text-[#EE98FF]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-lg mb-2 text-white">
                  Paste playlist URL:
                </label>
                <input
                  type="text"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="https://open.spotify.com/playlist/... or https://music.apple.com/playlist/..."
                  className="w-full p-2 bg-transparent border-2 border-[#EE98FF] text-white rounded"
                />
              </div>

              {convertError && (
                <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 text-red-500 rounded">
                  {convertError}
                </div>
              )}

              {convertSuccess && (
                <div className="p-3 bg-green-500 bg-opacity-20 border border-green-500 text-green-500 rounded">
                  {convertSuccess}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border-2 border-white text-white hover:bg-white hover:text-black rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConvert}
                  disabled={convertLoading || !playlistUrl}
                  className={`px-4 py-2 border-2 border-[#EE98FF] text-[#EE98FF] hover:bg-[#EE98FF] hover:text-black rounded flex items-center gap-2 ${convertLoading || !playlistUrl
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                    }`}
                >
                  {convertLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Converting...
                    </>
                  ) : (
                    "Convert"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ForegroundStatic />
    </div>
  );
}
