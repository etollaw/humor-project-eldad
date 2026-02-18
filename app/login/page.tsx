"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-4">Login</h1>
      <p className="opacity-70 mb-6">Sign in to view protected pages.</p>
      <button
        onClick={signIn}
        className="border rounded px-4 py-2 hover:opacity-80"
      >
        Sign in with Google
      </button>
    </main>
  );
}
