// Authorization token that must have been created previously. See : https://developer.spotify.com/documentation/web-api/concepts/authorization
// import fetch from 'node-fetch';

const token = 'BQA6rO0dhktJWfHU2ZPXyDP7RPm4efZNIgyVO1fO_YRrAk6R5pB3UbY26VnhMWk4BmA28i8q09mQtjeNif8c5xaxiNm1ErOZK2lK1rE4uLl_v1_8-YBGTbc6a_o8HhtFY4-qHr01znRZSc6Mwy3wJ_xqeAViW0U8GHNkDhFT8kwXFDN7zy7gfvppAly4fcYxGpdQEIqNLY2ZO54t1GC75bDEMuHI9CT-kFQDf131lImWg-ug-A5rioX_Qvo5F7hBY7UBPaf4ufgISQ';
async function fetchWebApi(endpoint, method, body) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
    body:JSON.stringify(body)
  });
  return await res.json();
}

const topTracksIds = [
  '4EG10OLde2d8EisbYoKTuZ','05zDB03E1WxCLyraJJ2I2r','0lPfqcI3A8gQ9971nXxgq6','3hRqmUI4Mzh5h0drGk24AF','7ovUcF5uHTBRzUpB6ZOmvt'
];

async function getRecommendations(){
  // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-recommendations
  return (await fetchWebApi(
    `v1/recommendations?limit=5&seed_tracks=${topTracksIds.join(',')}`, 'GET'
  )).tracks;
}

const recommendedTracks = getRecommendations();
console.log(
  recommendedTracks.map(
    ({name, artists}) =>
      `${name} by ${artists.map(artist => artist.name).join(', ')}`
  )
);