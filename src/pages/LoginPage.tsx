import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  async function handleGoogleSignIn() {
    setError(null);
    setSigningIn(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch {
      setError("Sign in failed. Please try again.");
      setSigningIn(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700 p-10 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">
          Welcome
        </h1>
        <p className="text-sm text-zinc-400 mb-8">Sign in to continue</p>

        <button
          onClick={handleGoogleSignIn}
          disabled={signingIn}
          className="w-full flex items-center justify-center gap-3 border border-zinc-200 dark:border-zinc-600 rounded-lg px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {signingIn ? "Signing in…" : "Sign in with Google"}
        </button>

        {error && (
          <p className="mt-4 text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}
