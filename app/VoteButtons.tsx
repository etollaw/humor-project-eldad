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
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVote = async (value: 1 | -1) => {
    if (!loggedIn) {
      setStatus("Log in to vote");
      return;
    }

    setLoading(true);
    setStatus(null);

    const result = await submitVote(captionId, value);

    if (result.error) {
      setStatus(result.error);
    } else {
      setStatus(value === 1 ? "Upvoted!" : "Downvoted!");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <button
        onClick={() => handleVote(1)}
        disabled={loading}
        className="border rounded px-3 py-1 text-sm hover:bg-green-100 disabled:opacity-50"
        title="Upvote"
      >
        👍
      </button>
      <button
        onClick={() => handleVote(-1)}
        disabled={loading}
        className="border rounded px-3 py-1 text-sm hover:bg-red-100 disabled:opacity-50"
        title="Downvote"
      >
        👎
      </button>
      {status && <span className="text-xs opacity-70">{status}</span>}
    </div>
  );
}
