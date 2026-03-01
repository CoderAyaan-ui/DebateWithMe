"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  // Show debate options directly (no auth required)
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <main className="text-center px-4 w-full">
        <Image src="/Pink White Black Simple Podcast Logo copy.png" alt="DebateWithMe Logo" width={260} height={260} className="mx-auto mb-6" />
        <h1 className="text-5xl sm:text-6xl font-bold text-blue-600 mb-6">Welcome to DebateWithMe!</h1>
        <div className="flex flex-col items-center gap-6 mt-8">
          <button 
            onClick={() => router.push('/multiplayer?type=world-schools')}
            className="bg-blue-600 text-blue-100 text-lg font-semibold py-3 px-8 rounded shadow hover:bg-blue-700 transition"
          >
            World Schools style
          </button>
          <button 
            onClick={() => router.push('/multiplayer?type=british-parliamentary')}
            className="bg-purple-600 text-blue-100 text-lg font-semibold py-3 px-8 rounded shadow hover:bg-purple-700 transition"
          >
            British Parliamentary style
          </button>
          <button 
            onClick={() => router.push('/multiplayer?type=quickfire-clash')}
            className="bg-green-600 text-blue-100 text-lg font-semibold py-3 px-8 rounded shadow hover:bg-green-700 transition"
          >
            Quickfire Clash
          </button>
          <button 
            onClick={() => router.push('/world-schools')}
            className="bg-indigo-600 text-blue-100 text-lg font-semibold py-3 px-8 rounded shadow hover:bg-indigo-700 transition"
          >
            Practice World Schools
          </button>
          <button 
            onClick={() => router.push('/british-parliamentary')}
            className="bg-pink-600 text-blue-100 text-lg font-semibold py-3 px-8 rounded shadow hover:bg-pink-700 transition"
          >
            Practice British Parliamentary
          </button>
        </div>
        <button 
          onClick={() => router.push('/quickfire-clash')}
          className="bg-gray-600 text-blue-100 text-lg font-semibold py-3 px-8 rounded shadow hover:bg-gray-700 transition"
        >
          Practice Quickfire Clash
        </button>
      </main>
    </div>
  );
}
