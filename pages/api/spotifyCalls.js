import fetch from "node-fetch";

const client_id = "00c764195eb94ed3ab674b0f9dca19be"; // replace both with .env stuff
const client_secret = "91003703b58a4f69bc00790531482aa5";
const redirect_uri = "http://localhost:6969";
const scopes = "user-read-private user-read-email";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const authorizeUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=token&redirect_uri=${encodeURIComponent(
  redirect_uri
)}&scope=${encodeURIComponent(scopes)}`;

const authString = Buffer.from(`${client_id}:${client_secret}`).toString(
  "base64"
);

// access token function
const getToken = async () => {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authString}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();

  // check if the access token was retrieved
  if (data.access_token) {
    console.log("Access token retrieved successfully:", data.access_token);
    return data.access_token;
  } else {
    console.error("Failed to retrieve access token:", data);
    return null; // if token retrieval failed
  }
};

// gets userID
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getUserID = async (accessToken) => {
  const response = await fetch(`https://api.spotify.com/v1/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    return data.id;
  } else {
    const errorData = await response.json();
    console.error(
      "Failed to fetch user ID:",
      response.status,
      response.statusText,
      errorData
    );
  }
};

// gets ISRC of a song
const getSongISRC = async (accessToken, songName, artistName) => {
  const formattedArtistName = artistName.split(" ").join("%2520");
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=remaster%2520track%3A${songName}%2520artist%3A${formattedArtistName}&type=track&limit=1`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.ok) {
    const data = await response.json();
    return data.tracks.items[0].external_ids.isrc; // returns isrc
  } else {
    const errorData = await response.json();
    console.error(
      "Failed to fetch song IRSC :",
      response.status,
      response.statusText,
      errorData
    );
  }
};

// gets playlist using playlistID
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getPlaylist = async (accessToken, playlistID) => {
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistID}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.ok) {
    const data = await response.json();
    return data.id;
  } else {
    const errorData = await response.json();
    console.error(
      "Failed to fetch user ID:",
      response.status,
      response.statusText,
      errorData
    );
  }
};

// creates playlist
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createPlaylist = async (accessToken, userID, playlistName, tracksIds) => {
  const response = await fetch(
    `https://api.spotify.com/v1/users/${userID}/playlists&name=${playlistName}`,
    {
      // not to sure ab playlist name
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (response.ok) {
    const data = await response.json();
    addTracksToPlaylist(accessToken, data.id, tracksIds);
    return data.id;
  } else {
    const errorData = await response.json();
    console.error(
      "Failed to create playlist:",
      response.status,
      response.statusText,
      errorData
    );
  }
};

// adds tracks to playlist, create playlist helper function
const addTracksToPlaylist = async (accessToken, playlistID, tracksIds) => {
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistID}/tracks?uris=${tracksIds.join(
      ","
    )}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.ok) {
    console.log("Tracks added to playlist successfully");
  } else {
    const errorData = await response.json();
    console.error(
      "Failed to add tracks to playlist:",
      response.status,
      response.statusText,
      errorData
    );
  }
};

// makes song recommendations based on given tracks
const numRecommendations = 10;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getRecommendations = async (accessToken, tracksIds) => {
  const response = await fetch(
    `https://api.spotify.com/v1/recommendations?limit=${numRecommendations}&seed_tracks=${tracksIds.join(
      ","
    )}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (response.ok) {
    const data = await response.json();
    // console.log('Recommended tracks: ', data.tracks);
    console.log(
      data.tracks.map(
        (track) =>
          `${track.name} by ${track.artists
            .map((artist) => artist.name)
            .join(", ")}`
      )
    );
  }
};

// Main execution
getToken()
  .then((accessToken) => {
    if (accessToken) {
      // returns isrc
      getSongISRC(accessToken, "Faith", "STXRZ").then((isrc) => {
        console.log(isrc);
      });

      // used for blend
      // getRecommendations(accessToken, ['4EG10OLde2d8EisbYoKTuZ','05zDB03E1WxCLyraJJ2I2r','0lPfqcI3A8gQ9971nXxgq6','3hRqmUI4Mzh5h0drGk24AF','7ovUcF5uHTBRzUpB6ZOmvt']);
    } else {
      console.error("No access token. Exiting...");
    }
  })
  .catch((error) => console.error("Error:", error));
