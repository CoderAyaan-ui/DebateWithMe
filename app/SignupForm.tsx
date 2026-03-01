"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SignupForm({ onSignup }: { onSignup: () => void }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Sign up user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });
      
      if (signUpError) {
        setError(signUpError.message);
      } else {
        onSignup();
      }
    } catch (err: any) {
      setError("Signup failed - please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      <h2 className="text-2xl font-bold text-blue-600">Sign Up</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
        className="border p-2 rounded text-blue-600"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="border p-2 rounded text-blue-600"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        className="border p-2 rounded text-blue-600"
      />
      {error && <div className="text-red-500">{error}</div>}
      {error && error.toLowerCase().includes("rate limit") && (
        <div className="text-blue-600 text-sm mt-1">
          Too many confirmation emails sent. Please check your inbox (and spam folder) for a previous confirmation email, or wait a few minutes before trying again.
        </div>
      )}
      <button type="submit" className="bg-blue-600 text-white py-2 rounded font-semibold" disabled={loading}>
        {loading ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  );
}
