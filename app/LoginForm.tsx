"use client";
import { useState } from "react";

export default function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const { supabase } = await import("../lib/supabaseClient");
      if (!supabase) {
        setError("Authentication service not available");
        return;
      }
      
      console.log("Attempting login with:", email);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Login timeout - please try again")), 10000);
      });
      
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      const { data, error: loginError } = await Promise.race([loginPromise, timeoutPromise]) as any;
      
      console.log("Login result:", { data, loginError });
      
      if (loginError) {
        console.error("Login error:", loginError);
        setError(loginError.message);
      } else if (data.user) {
        console.log("Login successful for user:", data.user.email);
        onLogin();
      } else {
        setError("Login failed - no user data returned");
      }
    } catch (err: any) {
      console.error("Unexpected login error:", err);
      if (err.message === "Login timeout - please try again") {
        setError("Login timed out - please check your connection and try again");
      } else {
        setError("An unexpected error occurred during login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      <h2 className="text-2xl font-bold text-blue-600">Login</h2>
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
      <button type="submit" className="bg-blue-600 text-white py-2 rounded font-semibold" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
