"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SignupForm from "./SignupForm";
import LoginForm from "./LoginForm";
import Image from "next/image";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [signedUp, setSignedUp] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  // Check for existing login state on component mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      setLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  if (loggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <main className="text-center px-4 w-full">
          <Image src="/Pink White Black Simple Podcast Logo copy.png" alt="DebateWithMe Logo" width={260} height={260} className="mx-auto mb-6" />
          <h1 className="text-5xl sm:text-6xl font-bold text-blue-600 mb-6">Welcome to DebateWithMe!</h1>
          <div className="flex flex-col items-center gap-6 mt-8">
            <button 
              onClick={() => router.push('/multiplayer?type=world-schools')}
              className="bg-blue-600 text-white text-lg font-semibold py-3 px-8 rounded shadow hover:bg-blue-700 transition"
            >
              World Schools style
            </button>
            <button 
              onClick={() => router.push('/multiplayer?type=british-parliamentary')}
              className="bg-purple-600 text-white text-lg font-semibold py-3 px-8 rounded shadow hover:bg-purple-700 transition"
            >
              British Parliamentary style
            </button>
            <button 
              onClick={() => router.push('/multiplayer?type=quickfire-clash')}
              className="bg-orange-600 text-white text-lg font-semibold py-3 px-8 rounded shadow hover:bg-orange-700 transition"
            >
              Quickfire Clash ⚡
            </button>
            <button 
              onClick={handleLogout}
              className="mt-4 text-red-600 underline hover:text-red-800 transition"
            >
              Logout
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <main className="text-center px-4 w-full">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">DebateWithMe</h1>
        <p className="text-xl text-gray-600 mb-8">
          Debate anytime, anywhere, in any style.
        </p>
        {showLogin ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <SignupForm onSignup={() => { setSignedUp(true); setShowLogin(true); }} />
        )}
        <div className="mt-4">
          {showLogin ? (
            <button className="text-blue-600 underline" onClick={() => setShowLogin(false)}>
              Don't have an account? Sign up
            </button>
          ) : (
            <button className="text-blue-600 underline" onClick={() => setShowLogin(true)}>
              Already have an account? Login
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
