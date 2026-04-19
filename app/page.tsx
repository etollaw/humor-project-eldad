import { createSupabaseServerClient } from "@/lib/supabase/server";
import VoteButtons from "./VoteButtons";
import Link from "next/link";
import Image from "next/image";

type CaptionRow = {
  id: string;
  content: string | null;
  created_datetime_utc: string;
  image_id: string | null;
  is_public: boolean;
};

type ImageRow = {
  id: string;
  url: string | null;
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("captions")
    .select("id, content, created_datetime_utc, image_id, is_public")
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
  const imageIds = Array.from(
    new Set(
      captions
        .map((caption) => caption.image_id)
        .filter((imageId): imageId is string => Boolean(imageId))
    )
  );

  const imageUrlById = new Map<string, string>();
  const voteScoreByCaptionId = new Map<string, number>();
  if (imageIds.length > 0) {
    const { data: images } = await supabase
      .from("images")
      .select("id, url")
      .in("id", imageIds);

    ((images ?? []) as ImageRow[]).forEach((image) => {
      if (image.url) {
        imageUrlById.set(image.id, image.url);
      }
    });
  }

  const captionIds = captions.map((caption) => caption.id);
  if (captionIds.length > 0) {
    const { data: votes } = await supabase
      .from("caption_votes")
      .select("caption_id, vote_value")
      .in("caption_id", captionIds);

    (votes ?? []).forEach((vote) => {
      const current = voteScoreByCaptionId.get(vote.caption_id) ?? 0;
      voteScoreByCaptionId.set(vote.caption_id, current + (vote.vote_value ?? 0));
    });
  }

  const captionsWithImages = captions.filter(
    (caption) => !!caption.image_id && imageUrlById.has(caption.image_id)
  );

  return (
    <main className="p-6 sm:p-8">
      <section className="rounded-2xl border border-foreground/15 bg-gradient-to-br from-foreground/[0.04] to-transparent p-6 sm:p-8 mb-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] opacity-55 mb-2">
              Week 3 Auth + Captions
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-2">
              Upload memes, generate captions, vote on the funniest ones.
            </h1>
            <p className="text-sm sm:text-base opacity-70 max-w-2xl">
              Browse the latest public caption generations and rank your favorites.
              Sign in to upload images and cast votes.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={user ? "/upload" : "/login"}
                className="inline-flex items-center rounded-lg bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {user ? "Upload an Image" : "Sign In to Upload"}
              </Link>
              <Link
                href="/protected"
                className="inline-flex items-center rounded-lg border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5 transition-colors"
              >
                Open Dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-foreground/15 bg-background/75 p-4 sm:p-5">
            <p className="text-sm font-semibold mb-3">Quick Upload</p>
            <p className="text-sm opacity-65 mb-4">
              Drop an image to generate new captions instantly.
            </p>
            <Link
              href={user ? "/upload" : "/login"}
              className="w-full inline-flex items-center justify-center rounded-lg border-2 border-dashed border-foreground/25 py-5 text-sm font-medium hover:border-foreground/45 hover:bg-foreground/[0.03] transition-colors"
            >
              {user ? "Go to Upload Page" : "Sign In First"}
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-foreground/15 bg-background/70 p-4">
          <p className="text-xs uppercase tracking-wide opacity-55">Step 1</p>
          <p className="mt-1 text-sm font-medium">Browse recent captions</p>
          <p className="mt-1 text-xs opacity-65">Start with the latest image-caption pairs below.</p>
        </div>
        <div className="rounded-xl border border-foreground/15 bg-background/70 p-4">
          <p className="text-xs uppercase tracking-wide opacity-55">Step 2</p>
          <p className="mt-1 text-sm font-medium">Vote on favorites</p>
          <p className="mt-1 text-xs opacity-65">Use Up/Down to rank humor quality. You can update your vote later.</p>
        </div>
        <div className="rounded-xl border border-foreground/15 bg-background/70 p-4">
          <p className="text-xs uppercase tracking-wide opacity-55">Step 3</p>
          <p className="mt-1 text-sm font-medium">Upload your own image</p>
          <p className="mt-1 text-xs opacity-65">Sign in to generate and share fresh captions.</p>
        </div>
      </section>

      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">Latest Captions</h2>
          <p className="text-sm opacity-60">
          {captionsWithImages.length} captions -{" "}
          {user ? "Vote on your favorites!" : "Sign in to vote on captions"}
          </p>
        </div>

        <ul className="space-y-4">
          {captionsWithImages.map((c) => (
            <li
              key={c.id}
              className="border border-foreground/15 bg-background/80 rounded-xl p-5 shadow-sm hover:border-foreground/35 hover:shadow-md transition-all"
            >
              <Image
                src={imageUrlById.get(c.image_id!)!}
                alt="Caption source"
                width={1200}
                height={675}
                className="w-full max-h-[320px] object-cover rounded-lg mb-4"
              />
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
                  <span>{voteScoreByCaptionId.get(c.id) ?? 0} vote score</span>
                </div>
                <VoteButtons captionId={c.id} loggedIn={!!user} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
