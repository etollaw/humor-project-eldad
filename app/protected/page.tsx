import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ProtectedPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
      <p className="text-sm opacity-60 mb-8">Your account overview</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="border rounded-xl p-5">
          <h2 className="text-sm font-medium opacity-50 mb-1">Signed in as</h2>
          <p className="font-semibold">{data.user.email}</p>
        </div>
        <div className="border rounded-xl p-5">
          <h2 className="text-sm font-medium opacity-50 mb-1">User ID</h2>
          <p className="font-mono text-sm break-all">{data.user.id}</p>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          href="/upload"
          className="border rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-foreground/5 transition-colors"
        >
          Upload Image
        </Link>
        <Link
          href="/"
          className="border rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-foreground/5 transition-colors"
        >
          Browse Captions
        </Link>
      </div>
    </main>
  );
}
