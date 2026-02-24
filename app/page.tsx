import { createSupabaseServerClient } from "@/lib/supabase/server";
import VoteButtons from "./VoteButtons";

type CaptionRow = {
  id: string;
  content: string | null;
  created_datetime_utc: string;
  image_id: string | null;
  is_public: boolean;
  like_count: number | null;
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("captions")
    .select("id, content, created_datetime_utc, image_id, is_public, like_count")
    .order("created_datetime_utc", { ascending: false })
    .limit(15);

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-4">Captions</h1>
        <p className="text-red-500">Error: {error.message}</p>
      </main>
    );
  }

  const captions = (data ?? []) as CaptionRow[];

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Latest Captions</h1>
        <p className="text-sm opacity-60">
          {captions.length} captions ·{" "}
          {user ? "Vote on your favorites!" : "Sign in to vote on captions"}
        </p>
      </div>

      <ul className="space-y-4">
        {captions.map((c) => (
          <li
            key={c.id}
            className="border rounded-xl p-5 hover:border-foreground/30 transition-colors"
          >
            <p className="text-lg leading-relaxed">
              {c.content ?? <span className="italic opacity-50">(no content)</span>}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs opacity-50 flex flex-wrap gap-x-3 gap-y-1">
                <span>
                  {new Date(c.created_datetime_utc).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                {c.like_count != null && <span>{c.like_count} likes</span>}
              </div>
              <VoteButtons captionId={c.id} loggedIn={!!user} />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
