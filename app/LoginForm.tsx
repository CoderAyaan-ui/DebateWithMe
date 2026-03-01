"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

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
      console.log("Attempting login with:", email);
      
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log("Login result:", { data, loginError });
      
      if (loginError) {
        setError(loginError.message);
      } else if (data.user) {
        console.log("Login successful");
        onLogin();
      } else {
        setError("Login failed - please try again");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Login failed - please check your credentials");
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
