import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import type { SpotifyPlaylist } from '../types/spotify';
// import { getMusicUserToken } from '@/utils/appleMusicAuth';
import Image from 'next/image';
import logo from "@/public/assets/logo.png";
import playIcon from "@/public/assets/play-icon.svg";
import topLeft from "@/public/assets/top-left.svg";
import bottomRight from "@/public/assets/bottom-right.svg";
import gridBg from "@/public/assets/grid-bg.png";
import sparkle from "@/public/assets/sparkle.svg";
import lines from "@/public/assets/lines.svg";
import jpWords from "@/public/assets/jp-words.svg";
import header from "@/public/assets/header.png";
import { VT323 } from 'next/font/google';
import ForegroundStatic from '@/components/ForegroundStatic';
import CartridgeCarousel from '@/components/CartridgeCarousel';
import { EmblaOptionsType } from 'embla-carousel'
import loadingImg from "@/public/assets/loading.png";

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
});

const OPTIONS: EmblaOptionsType = { loop: true }

export default function Home() {
  const { data: session, status } = useSession();
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      <div className={`${vt323.className} p-4 flex flex-col items-center justify-center min-h-dvh gap-8 text-white relative`}>
        <Image src={gridBg} alt="Grid" className="absolute bottom-0 left-0 w-full" />
        <div className="absolute bg-random-dots bg-repeat top-0 right-0 w-full h-full" />
        <Image src={sparkle} alt="Sparkle" className="absolute top-[5%] left-[5%] w-[6%] sm:w-[3%]" />
        <Image src={sparkle} alt="Sparkle" className="absolute bottom-[5%] right-[5%] w-[6%] sm:w-[3%]" />
        <Image src={lines} alt="Lines" className="absolute top-[6%] right-[5%] w-[15%] sm:w-[10%]" />
        <Image src={jpWords} alt="JP Words" className="absolute top-[12%] sm:top-[18%] right-[5%] w-[16%] sm:w-[7%]" />
        <div className="relative w-[95%] sm:w-[60%]">
          <Image src={logo} alt="Bridge" className="w-full" />
          <Image src={topLeft} alt="top left" className="absolute top-0 left-0 w-[14%]" />
          <Image src={bottomRight} alt="bottom right" className="absolute bottom-0 right-0 w-[14%]" />
        </div>
        <div className="flex gap-4 z-[9999]">
          <Image src={playIcon
          } alt="Play" className="w-8" />
          <button
            onClick={() => signIn()}
            className="text-2xl px-6 py-2 border-2 border-white hover:bg-white hover:text-black"
          >
            Sign in
          </button>
        </div>
        <p className="absolute bottom-8 text-lg">© 2024 DEVLOG Design, inc. ALL RIGHTS RESERVED</p>
        <ForegroundStatic />
      </div>
    );
  }

  return (
    <div className={`${vt323.className} p-4 flex flex-col items-center justify-center min-h-dvh text-white relative`}>
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
        {playlists.length !== 0 && <CartridgeCarousel slides={playlists} options={OPTIONS} />}
      </div>

      {/* <div className="grid grid-cols-1 gap-4 w-1/4">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="border p-4 rounded shadow hover:shadow-md transition-shadow"
            onClick={() => fetchPlaylistDetails(playlist.id)}
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
      <button className="px-6 py-2 border-2 border-[#EE98FF] flex items-center justify-center gap-4 text-4xl text-[#EE98FF] my-16 hover:bg-[#EE98FF] hover:text-black">
        <svg width="37" height="40" viewBox="0 0 37 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 7.29419H30.5V32.706H18.5V20.0001H27.5V13.6471H15.5V32.706H3.5V20.0001H12.5V7.29419ZM12.5 23.1765H6.5V29.5295H12.5V23.1765ZM27.5 23.1765H21.5V29.5295H27.5V23.1765Z" fill="currentColor" />
        </svg>
        Convert
      </button>
      <ForegroundStatic />
    </div>
  );
}