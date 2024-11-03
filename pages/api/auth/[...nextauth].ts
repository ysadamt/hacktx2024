import NextAuth, { AuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import AppleProvider from "next-auth/providers/apple";
import { JWT } from "next-auth/jwt";

const scopes = [
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-read-email",
  "user-read-private",
].join(" ");

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || "Failed to refresh token");
    }

    return {
      ...token,
      accessToken: data.access_token,
      expiresAt: Math.floor(Date.now() / 1000 + data.expires_in),
    };
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: AuthOptions = {
  cookies: {
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
  },
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
      authorization: {
        params: { scope: scopes },
      },
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID as string,
      clientSecret: process.env.APPLE_SECRET as string,
      authorization: {
        params: {
          scope: "name email musickit",
        },
      },
      httpOptions: {
        timeout: 10000,
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        return token;
      }

      if (token.expiresAt && Date.now() < token.expiresAt * 1000) {
        return token;
      }

      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
};

export default NextAuth(authOptions);
