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
