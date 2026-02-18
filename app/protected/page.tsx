import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SignOutButton from "./SignOutButton";

export default async function ProtectedPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-4">Protected</h1>
      <p className="opacity-70">
        You are logged in as <b>{data.user.email}</b>
      </p>
      <SignOutButton />
    </main>
  );
}
