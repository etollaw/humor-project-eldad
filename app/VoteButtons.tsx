"use client";

import { submitVote } from "./actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VoteButtons({
  captionId,
  loggedIn,
  initialScore,
}: {
  captionId: string;
  loggedIn: boolean;
  initialScore: number;
}) {
  const router = useRouter();
  const [voted, setVoted] = useState<1 | -1 | null>(null);
  const [score, setScore] = useState(initialScore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleVote = async (value: 1 | -1) => {
    if (!loggedIn) {
      setError("Sign in to vote");
      return;
    }

    setLoading(true);
    setError(null);
    setFeedback(null);

    const result = await submitVote(captionId, value);

    if (result.error) {
      setError(result.error);
    } else {
      const delta = voted === null ? value : value - voted;
      setScore((prev) => prev + delta);
      setVoted(value);
      setFeedback(result.updated ? "Vote updated" : "Vote saved");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        {voted ? (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-foreground/5">
            {voted === 1 ? "Upvoted" : "Downvoted"}
          </span>
        ) : null}
        {feedback ? <span className="text-xs text-emerald-600">{feedback}</span> : null}
      </div>

      <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote(1)}
        disabled={loading}
        className="rounded-full px-3 py-1.5 text-sm border hover:bg-green-500/10 hover:border-green-500/40 disabled:opacity-40 transition-colors"
        title="Upvote"
      >
        Up
      </button>
      <button
        onClick={() => handleVote(-1)}
        disabled={loading}
        className="rounded-full px-3 py-1.5 text-sm border hover:bg-red-500/10 hover:border-red-500/40 disabled:opacity-40 transition-colors"
        title="Downvote"
      >
        Down
      </button>
      </div>

      {error ? <span className="text-xs text-red-500">{error}</span> : null}
      <span className="text-[11px] opacity-65">Score: {score}</span>
      <span className="text-[11px] opacity-60">You can change your vote any time.</span>
    </div>
  );
}
