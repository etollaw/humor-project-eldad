import { supabase } from "@/lib/supabase";

type CaptionRow = {
  id: string;
  content: string | null;
  created_datetime_utc: string;
  image_id: string | null;
  is_public: boolean;
  like_count: number | null;
};

export default async function Home() {
  const { data, error } = await supabase
    .from("captions")
    .select("id, content, created_datetime_utc, image_id, is_public, like_count")
    .order("created_datetime_utc", { ascending: false })
    .limit(15);

  if (error) {
    return (
      <main className="p-10">
        <h1 className="text-3xl font-bold mb-4">Captions</h1>
        <p className="text-red-500">Error: {error.message}</p>
      </main>
    );
  }

  const captions = (data ?? []) as CaptionRow[];

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-2">Captions</h1>
      <p className="text-sm opacity-70 mb-6">
        Showing {captions.length} rows from Supabase
      </p>

      <ul className="space-y-3">
        {captions.map((c) => (
          <li key={c.id} className="border rounded-lg p-4">
            <p className="text-lg">{c.content ?? "(no content)"}</p>

            <div className="mt-3 text-xs opacity-70 flex flex-wrap gap-x-4 gap-y-1">
              <span>ID: {c.id.slice(0, 8)}…</span>
              <span>Image: {c.image_id ? c.image_id.slice(0, 8) + "…" : "—"}</span>
              <span>Public: {String(c.is_public)}</span>
              <span>Likes: {c.like_count ?? "—"}</span>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
