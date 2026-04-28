"use client";

import { useState, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type CaptionResult = {
  id: string;
  content: string;
  [key: string]: unknown;
};

export default function UploadForm() {
  const supabase = createSupabaseBrowserClient();
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [captions, setCaptions] = useState<CaptionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setFileName(file.name);
      setCaptions([]);
      setError(null);
      setImageUrl(null);
    }
  };

  const handleSubmit = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError(null);
    setCaptions([]);
    setStep("Uploading image and generating captions...");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;
      if (!token) {
        throw new Error("You must be logged in.");
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
        throw new Error(`Unsupported image type: ${contentType}`);
      }

      const apiBase = "https://api.almostcrackd.ai";

      const step1Res = await fetch(`${apiBase}/pipeline/generate-presigned-url`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contentType }),
      });

      if (!step1Res.ok) {
        throw new Error(`Step 1 failed (${step1Res.status}): ${await step1Res.text()}`);
      }

      const { presignedUrl, cdnUrl } = await step1Res.json();

      const step2FormData = new FormData();
      step2FormData.append("presignedUrl", presignedUrl);
      step2FormData.append("contentType", contentType);
      step2FormData.append("file", file);

      const step2Res = await fetch("/api/upload-to-presigned", {
        method: "POST",
        body: step2FormData,
      });

      if (!step2Res.ok) {
        throw new Error(`Step 2 upload failed (${step2Res.status}): ${await step2Res.text()}`);
      }

      const step3Res = await fetch(`${apiBase}/pipeline/upload-image-from-url`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
      });

      if (!step3Res.ok) {
        throw new Error(`Step 3 register failed (${step3Res.status}): ${await step3Res.text()}`);
      }

      const { imageId } = await step3Res.json();

      const step4Res = await fetch(`${apiBase}/pipeline/generate-captions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageId }),
      });

      if (!step4Res.ok) {
        throw new Error(`Step 4 caption generation failed (${step4Res.status}): ${await step4Res.text()}`);
      }

      const result = await step4Res.json();

      setCaptions(result ?? []);
      setImageUrl(cdnUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected upload failure");
    }

    setStep(null);
    setLoading(false);
  };

  return (
    <div>
      {/* File picker area */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-foreground/30 bg-background/80 rounded-xl p-8 text-center cursor-pointer hover:border-foreground/50 hover:bg-foreground/[0.03] transition-colors mb-4"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
          onChange={handleFileChange}
          className="hidden"
        />
        {preview ? (
          <div className="flex flex-col items-center gap-3">
            <img
              src={preview}
              alt="Preview"
              className="max-w-xs max-h-48 rounded-lg object-contain"
            />
            <p className="text-sm opacity-60">{fileName} - Click to change</p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium mb-1">Click to select an image</p>
            <p className="text-sm opacity-50">JPEG, PNG, WebP, GIF, or HEIC</p>
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !preview}
        className="w-full sm:w-auto bg-foreground text-background rounded-lg px-6 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
      >
        {loading ? "Processing..." : "Upload & Generate Captions"}
      </button>

      {step && (
        <div className="mt-4 flex items-center gap-2 text-sm opacity-60">
          <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
          {step}
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-500 bg-red-500/10 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      {imageUrl && (
        <div className="mt-6 border border-foreground/20 bg-background/80 rounded-xl p-4">
          <p className="text-sm font-medium mb-2">Uploaded image</p>
          <img
            src={imageUrl}
            alt="Uploaded"
            className="max-w-sm max-h-64 rounded-lg object-cover"
          />
        </div>
      )}

      {captions.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-3">
            Generated Captions ({captions.length})
          </h2>
          <ul className="space-y-2">
            {captions.map((c, i) => (
              <li
                key={c.id ?? i}
                className="border border-foreground/15 bg-background/80 rounded-xl p-4 hover:border-foreground/35 transition-colors"
              >
                <p>{c.content ?? JSON.stringify(c)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
