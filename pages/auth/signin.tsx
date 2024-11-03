import React, { useCallback, useState } from "react";
import { signIn } from "next-auth/react";
import { SiApplemusic, SiSpotify } from "react-icons/si";
import type { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import { getServerAuthSession } from "@/utils/auth";
import { VT323 } from 'next/font/google';
import ForegroundStatic from '@/components/ForegroundStatic';
import Image from 'next/image';
import gridBg from "@/public/assets/grid-bg.png";
import sparkle from "@/public/assets/sparkle.svg";
import lines from "@/public/assets/lines.svg";

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
});

type SigninOptions = "spotify" | "apple";

// default next-auth error messages mapped for each error type.
const errors: any = {
  Signin: "Try signing in with a different account.",
  OAuthSignin: "Try signing in with a different account.",
  OAuthCallback: "Try signing in with a different account.",
  OAuthCreateAccount: "Try signing in with a different account.",
  EmailCreateAccount: "Try signing in with a different account.",
  Callback: "Try signing in with a different account.",
  OAuthAccountNotLinked:
    "To confirm your identity, sign in with the same account you used originally.",
  EmailSignin: "The e-mail could not be sent.",
  CredentialsSignin:
    "Sign in failed. Check the details you provided are correct.",
  SessionRequired: "Please sign in to access this page.",
  default: "Unable to sign in.",
};

type LoadingState = Record<SigninOptions, boolean>;

const SigninPage: NextPage = () => {
  const router = useRouter();
  const errorType = router.query.error as any;
  const callbackUrl = router.query.callbackUrl as string;

  const [isLoading, setIsLoading] = useState<LoadingState>({
    spotify: false,
    apple: false,
  });

  /**
   * If one of the sign-in options is loading,
   * the rest should be disabled.
   */
  const getDisabledState = (type: SigninOptions) => {
    return Object.entries(isLoading).some(([key, value]) => {
      return key !== type && value === true;
    });
  };

  const error = errorType && (errors[errorType] ?? errors.default);

  const handleSignIn = useCallback(
    (type: Exclude<SigninOptions, "email">) => async () => {
      setIsLoading((prev) => ({ ...prev, [type]: true }));

      await signIn(type, {
        callbackUrl: callbackUrl || "/",
      });

      setIsLoading((prev) => ({ ...prev, [type]: false }));
    },
    [callbackUrl]
  );

  return (
    <>
      <div className={`flex min-h-dvh items-center justify-center px-4 py-12 sm:px-6 lg:px-8 ${vt323.className} text-white relative`}>
        <Image src={gridBg} alt="Grid" className="absolute bottom-0 left-0 w-full" />
        <div className="absolute bg-random-dots bg-repeat top-0 right-0 w-full h-full" />
        <Image src={sparkle} alt="Sparkle" className="absolute top-[5%] left-[5%] w-[6%] sm:w-[3%]" />
        <Image src={sparkle} alt="Sparkle" className="absolute bottom-[5%] right-[5%] w-[6%] sm:w-[3%]" />
        <Image src={lines} alt="Lines" className="absolute top-[6%] right-[5%] w-[15%] sm:w-[10%]" />
        <div className="flex flex-col gap-8 z-[9999]">
          <div>
            <h1 className="text-4xl">
              Sign in to your account
            </h1>
          </div>

          <div className="flex flex-col gap-3 text-lg">
            <button
              disabled={getDisabledState("spotify")}
              onClick={handleSignIn("spotify")}
              className="flex items-center justify-center gap-3 border-2 border-white py-2 px-6 hover:bg-white hover:text-black"
            >
              <SiSpotify size={20} color="#1DB954" />
              Sign in with Spotify
            </button>

            <button
              disabled={getDisabledState("apple")}
              onClick={handleSignIn("apple")}
              className="flex items-center justify-center gap-3 border-2 border-white py-2 px-6 hover:bg-white hover:text-black"
            >
              <SiApplemusic size={19} color="#FA2D48" />
              Sign in with Apple Music
            </button>
          </div>
        </div>
        <p className="absolute bottom-8 text-lg">© 2024 DEVLOG Design, inc. ALL RIGHTS RESERVED</p>
        <ForegroundStatic />
      </div>
    </>
  );
};

export default SigninPage;

export async function getServerSideProps({
  req,
  res,
}: GetServerSidePropsContext) {
  const session = await getServerAuthSession({ req, res });

  // If the user is already logged in, redirect.
  if (session) {
    return { redirect: { destination: "/" } };
  }

  // Could return the providers as an array if we wanted.
  // const providers = await getProviders();

  return {
    props: {},
  };
}