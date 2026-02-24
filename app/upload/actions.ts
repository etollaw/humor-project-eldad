"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const API_BASE = "https://api.almostcrackd.ai";

export async function uploadAndGenerateCaptions(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  // Verify user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { error: "You must be logged in." };
  }

  const token = session.access_token;

  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) {
    return { error: "No image file provided." };
  }

  const contentType = file.type;
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
  ];
  if (!allowedTypes.includes(contentType)) {
    return { error: `Unsupported image type: ${contentType}` };
  }

  // Step 1: Generate presigned URL
  const step1Res = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contentType }),
  });

  if (!step1Res.ok) {
    const text = await step1Res.text();
    return { error: `Step 1 failed (${step1Res.status}): ${text}` };
  }

  const { presignedUrl, cdnUrl } = await step1Res.json();

  // Step 2: Upload image bytes to presigned URL
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const step2Res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: fileBuffer,
  });

  if (!step2Res.ok) {
    const text = await step2Res.text();
    return { error: `Step 2 upload failed (${step2Res.status}): ${text}` };
  }

  // Step 3: Register image URL in the pipeline
  const step3Res = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
  });

  if (!step3Res.ok) {
    const text = await step3Res.text();
    return { error: `Step 3 register failed (${step3Res.status}): ${text}` };
  }

  const { imageId } = await step3Res.json();

  // Step 4: Generate captions
  const step4Res = await fetch(`${API_BASE}/pipeline/generate-captions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageId }),
  });

  if (!step4Res.ok) {
    const text = await step4Res.text();
    return { error: `Step 4 caption generation failed (${step4Res.status}): ${text}` };
  }

  const captions = await step4Res.json();

  revalidatePath("/");
  return { success: true, captions, imageUrl: cdnUrl, imageId };
}
