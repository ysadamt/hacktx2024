interface MusicKitInstance {
  authorize(): Promise<string>;
  getInstance(): any;
}

declare global {
  interface Window {
    MusicKit: {
      configure: (configuration: any) => MusicKitInstance;
    };
  }
}

export async function getMusicUserToken(developerToken: string) {
  if (typeof window === "undefined") return null;

  const musicKit = window.MusicKit.configure({
    developerToken,
    app: {
      name: "Your App Name",
      build: "1.0.0",
    },
  });

  try {
    const userToken = await musicKit.authorize();
    return userToken;
  } catch (error) {
    console.error("Error getting user token:", error);
    return null;
  }
}
