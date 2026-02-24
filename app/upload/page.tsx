import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import UploadForm from "./UploadForm";

export default async function UploadPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-1">Upload Image</h1>
      <p className="text-sm opacity-60 mb-8">
        Upload an image to generate AI-powered captions.
      </p>
      <UploadForm />
    </main>
  );
}
