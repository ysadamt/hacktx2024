// export function generateAppleToken() {
//   const privateKey = process.env.APPLE_MUSIC_PRIVATE_KEY;
//   const teamId = process.env.APPLE_MUSIC_TEAM_ID;
//   const keyId = process.env.APPLE_MUSIC_KEY_ID;

//   const token = jwt.sign({}, privateKey, {
//     algorithm: "ES256",
//     expiresIn: "1h",
//     issuer: teamId,
//     header: {
//       alg: "ES256",
//       kid: keyId,
//     },
//   });

//   return token;
// }

export async function searchAppleMusic(isrc: string, developerToken: string) {
  try {
    const response = await fetch(
      `https://api.music.apple.com/v1/catalog/us/songs?filter[isrc]=${isrc}`,
      {
        headers: {
          Authorization: `Bearer ${developerToken}`,
        },
      }
    );

    const data = await response.json();
    return data.data?.[0]?.id || null;
  } catch (error) {
    console.error(`Error searching Apple Music for ISRC ${isrc}:`, error);
    return null;
  }
}

// export async function createApplePlaylist(
//   name,
//   description,
//   trackIds,
//   developerToken,
//   musicUserToken
// ) {
//   try {
//     // creating the playlist
//     const createResponse = await fetch(
//       "https://api.music.apple.com/v1/me/library/playlists",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${developerToken}`,
//           "Music-User-Token": musicUserToken,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           attributes: {
//             name,
//             description,
//           },
//         }),
//       }
//     );

//     const playlist = await createResponse.json();
//     const playlistId = playlist.data[0].id;

//     // adding tracks to the playlist
//     const tracksResponse = await fetch(
//       `https://api.music.apple.com/v1/me/library/playlists/${playlistId}/tracks`,
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${developerToken}`,
//           "Music-User-Token": musicUserToken,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           data: trackIds.map((id) => ({
//             id,
//             type: "songs",
//           })),
//         }),
//       }
//     );

//     return {
//       playlistId,
//       success: tracksResponse.ok,
//     };
//   } catch (error) {
//     console.error("Error creating Apple Music playlist:", error);
//     throw error;
//   }
// }
