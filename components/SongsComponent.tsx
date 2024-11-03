import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";


const SongsComponent = ({ playlistHref }: { playlistHref: string }) => {
  const { data: session } = useSession();
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const fetchSongs = async () => {
      if (!session) return;
      try {
        const response = await fetch(playlistHref, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch playlist details');
        }

        const data = await response.json();
        setSongs(data.tracks.items);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSongs();
  }, [playlistHref]);

  return (
    <div className="flex flex-col w-3/4 gap-8 h-[700px] p-6 overflow-y-scroll border-2 border-white bg-[#212121]">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {songs.map((track: any) => (
        <div
          key={track.track.id}
          className="flex justify-between items-center w-full border-2 border-[#EE98FF]"
        >
          {track.track.album.images[0] && (
            <img
              src={track.track.album.images[0].url}
              alt={`${track.track.name} cover`}
              className="w-24 object-cover"
            />
          )}
          <div className="flex flex-col justify-end text-end pr-4">
            <p className="text-xl font-bold">{track.track.name}</p>
            <p className="">{track.track.artists[0].name}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SongsComponent;