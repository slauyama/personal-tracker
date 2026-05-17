import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button, Heading, Text } from "@slauyama/ui";

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
    } catch (error) {
      console.log(error);
      setError("Sign in failed. Please try again.");
      setSigningIn(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700 p-10 w-full max-w-sm text-center">
        <Heading as="h1" variant="display" className="mb-2">
          Welcome
        </Heading>
        <Text variant="muted" as="p" className="mb-8">
          Sign in to continue
        </Text>

        <Button
          variant="secondary"
          onClick={handleGoogleSignIn}
          disabled={signingIn}
          className="w-full"
        >
          {signingIn ? "Signing in…" : "Sign in with Google"}
        </Button>

        {error && (
          <Text variant="caption" as="p" className="mt-4 text-red-500">
            {error}
          </Text>
        )}
      </div>
    </div>
  );
}
