"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitVote(captionId: string, voteValue: 1 | -1) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to vote." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { error: "Unable to resolve your profile. Please sign in again." };
  }

  const profileId = profile.id;

  const { data: existingVote, error: existingVoteError } = await supabase
    .from("caption_votes")
    .select("id")
    .eq("caption_id", captionId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (existingVoteError) {
    return { error: existingVoteError.message };
  }

  let mutationError: { message: string } | null = null;
  const isUpdatingExistingVote = Boolean(existingVote);

  if (existingVote) {
    const { error } = await supabase
      .from("caption_votes")
      .update({
        vote_value: voteValue,
        modified_datetime_utc: new Date().toISOString(),
      })
      .eq("id", existingVote.id);
    mutationError = error;
  } else {
    const { error } = await supabase.from("caption_votes").insert({
      caption_id: captionId,
      profile_id: profileId,
      vote_value: voteValue,
      created_datetime_utc: new Date().toISOString(),
      modified_datetime_utc: new Date().toISOString(),
    });
    mutationError = error;
  }

  if (mutationError) {
    return { error: mutationError.message };
  }

  revalidatePath("/");
  return { success: true, updated: isUpdatingExistingVote };
}
