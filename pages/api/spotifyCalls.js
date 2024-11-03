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

// console.log(process.env);
// console.log('Client ID:', client_id);
// console.log('Client Secret:', client_secret);

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

  // Check if the access token was retrieved successfully
  if (data.access_token) {
    console.log("Access token retrieved successfully:", data.access_token);
    return data.access_token;
  } else {
    console.error("Failed to retrieve access token:", data);
    return null; // Return null if the token retrieval failed
  }
};

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
    // Log error details
    const errorData = await response.json();
    console.error(
      "Failed to fetch user ID:",
      response.status,
      response.statusText,
      errorData
    );
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getPlaylists = async (accessToken) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const response = await fetch(`https://api.spotify.com/v1/playlists`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

// function for playlist song isrc, returns arr of isrcs
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getPlaylistISRC = async (accessToken, playlistId) => {
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.ok) {
    const data = await response.json();
    const arr = []; // Initialize an empty array

    data.items.forEach((item) => {
      if (
        item.track &&
        item.track.external_ids &&
        item.track.external_ids.isrc
      ) {
        arr.push(item.track.external_ids.isrc); // push only isrc value
      }
    });

    return arr;
  } else {
    console.error(
      "Failed to fetch playlist:",
      response.status,
      response.statusText
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
      console.log(getUserID(accessToken));

      //console.log(getPlaylistIRSC(accessToken, '4Lw3GV7Q3hvfFYFwAaBNWy'));

      // getRecommendations(accessToken, ['4EG10OLde2d8EisbYoKTuZ','05zDB03E1WxCLyraJJ2I2r','0lPfqcI3A8gQ9971nXxgq6','3hRqmUI4Mzh5h0drGk24AF','7ovUcF5uHTBRzUpB6ZOmvt']);
    } else {
      console.error("No access token. Exiting...");
    }
  })
  .catch((error) => console.error("Error:", error));
