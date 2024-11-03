# Bridge: A Spotify-to-Apple Music port


## Inspiration
Have you ever wanted to share your music tastes with your friends, but they only use Spotify and you have Apple Music? Bridge connects people across music platforms and enables you to share playlists (game cartridges in Bridge) with your friends even if you don't use the same platform. 

## How we built it
We used Next.js, Tailwind CSS, and React to build the web app. We used the Spotify and Apple Music APIs to connect and convert playlists across the platforms. We also used OpenAI's API to generate recommendations based on a given prompt. All of the frontend was planned and designed on Figma, and the assets were created on Procreate and Blender.

## Challenges we ran into
Apple Music API was very difficult to use and did not have a lot of documentation for the tasks we wanted to implement. Getting the Apple Music API to connect and authenticate was also very time-consuming.

## Accomplishments that we're proud of
We implemented a recommendation model that's able to take a user's emotions/entered prompt and generate a playlist based on that input. It can gauge the "vibe" of a user's existing playlists and recommend songs that the user would enjoy. Additionally, it can take any prompt, such as nouns, phrases, and descriptions, and expands the user's music library through recommended songs.

## What's next for Bridge
Bridge currently lets Spotify users create playlists for their friends who use Apple Music. We hope to implement a 'blend' feature, which will allow users to create playlist mashups with friends, across both platforms. We also plan to look into expanding the conversion feature to other platforms like YouTube Music.
