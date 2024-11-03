// ExampleComponent.js - Your client-side component
import { useSession } from 'next-auth/react';
import { VT323 } from 'next/font/google';
import React, { useState } from 'react';
// import { fetchOpenAI } from './api/openai'; // Adjust the import path as needed

const vt323 = VT323({
    weight: "400",
    subsets: ["latin"],
});

const ExampleComponent = () => {
    const [result, setResult] = useState('');
    const [applePlaylistLink, setApplePlaylistLink] = useState<string | null>(null);
    const { data: session } = useSession();

    const handleFetch = async () => {
        console.log('asdasdasdas')
        try {
            const ask = result;
            const response = await fetch('/api/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ask }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            console.log(data);

            const isrcs = data.result.map(async (pair: string[]) => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                const isrc = await fetch(`/api/spotify-find-isrc?songName=${pair[0]}&artistName=${pair[1]}&accessToken=${session?.accessToken!}`, {
                    method: 'GET',
                });

                const isrcRes = await isrc.json();
                return isrcRes;
            });

            const finalRes = await Promise.all(isrcs);

            const response2 = await fetch(`api/convert-to-apple?playlistName=${result}&isrcArr=${JSON.stringify(finalRes)}`);

            if (!response2.ok) {
                throw new Error('Failed to get playlist');
            }

            const data2 = await response2.json();
            setApplePlaylistLink(data2.playlistUrl);
        } catch (error) {
            console.error('Error fetching OpenAI:', error);
        }
    };

    return (
        <div className={`${vt323.className} flex flex-col w-full justify-center min-h-dvh items-center p-4 gap-6`}>
            <h1 className="text-6xl text-white">Recommender</h1>
            <input
                type="text"
                className="border-2 bg-transparent text-white py-2 px-4 mb-4 text-2xl w-1/3"
                placeholder="Enter your prompt"
                onChange={(e) => setResult(e.target.value)}
            />
            <button onClick={handleFetch} className="border-[#EE98FF] text-[#EE98FF] text-xl font-bold py-2 px-4 border-2 hover:text-black hover:bg-[#EE98FF]">
                Find me some songs!
            </button>
            <div className="mt-4 mb-8">
                {applePlaylistLink && (
                    <a
                        href={`https://music.apple.com/us/library/playlist/${applePlaylistLink.split("/playlists/")[1]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#EE98FF] text-2xl hover:underline"
                    >
                        View generated playlist
                    </a>
                )}
            </div>
        </div >
    );
};

export default ExampleComponent;
