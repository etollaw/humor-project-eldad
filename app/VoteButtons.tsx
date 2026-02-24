"use client";

import { submitVote } from "./actions";
import { useState } from "react";

export default function VoteButtons({
  captionId,
  loggedIn,
}: {
  captionId: string;
  loggedIn: boolean;
}) {
  const [voted, setVoted] = useState<1 | -1 | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async (value: 1 | -1) => {
    if (!loggedIn) {
      setError("Sign in to vote");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await submitVote(captionId, value);

    if (result.error) {
      setError(result.error);
    } else {
      setVoted(value);
    }
    setLoading(false);
  };

  if (voted) {
    return (
      <span className="text-xs font-medium px-2 py-1 rounded-full bg-foreground/5">
        {voted === 1 ? "👍 Upvoted" : "👎 Downvoted"}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => handleVote(1)}
        disabled={loading}
        className="rounded-full px-2.5 py-1 text-sm border hover:bg-green-500/10 hover:border-green-500/40 disabled:opacity-40 transition-colors"
        title="Upvote"
      >
        👍
      </button>
      <button
        onClick={() => handleVote(-1)}
        disabled={loading}
        className="rounded-full px-2.5 py-1 text-sm border hover:bg-red-500/10 hover:border-red-500/40 disabled:opacity-40 transition-colors"
        title="Downvote"
      >
        👎
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
