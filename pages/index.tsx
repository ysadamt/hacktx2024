import { useSession } from "next-auth/react";
import { signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className='p-6'>
        <p className='text-white font-normal text-xl mt-5 mb-2'>Signed In as</p>
        <span className='bold-txt'>{session?.user?.name}</span>
        <p className='opacity-70 mt-8 mb-5 underline cursor-pointer' onClick={() => signOut()}>Sign Out</p>
      </div>
    )
  } else {
    return (
      <button onClick={() => signIn()} className='shadow-primary w-56 h-16 rounded-xl bg-white border-0 text-black text-3xl active:scale-[0.99] m-6'>Sign In</button>
    )
  }
}
