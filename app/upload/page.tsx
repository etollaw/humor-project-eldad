import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import UploadForm from "./UploadForm";
import Link from "next/link";

export default async function UploadPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  return (
    <main className="p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Upload Image & Generate Captions</h1>
        <Link href="/" className="text-sm underline opacity-70">
          ← Back to captions
        </Link>
      </div>
      <p className="opacity-70 mb-6">
        Upload an image to generate AI captions. Logged in as{" "}
        <b>{data.user.email}</b>.
      </p>
      <UploadForm />
    </main>
  );
}
