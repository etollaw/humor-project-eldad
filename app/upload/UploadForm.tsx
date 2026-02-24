"use client";

import { useState, useRef } from "react";
import { uploadAndGenerateCaptions } from "./actions";

type CaptionResult = {
  id: string;
  content: string;
  [key: string]: unknown;
};

export default function UploadForm() {
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

    const formData = new FormData();
    formData.append("image", file);

    const result = await uploadAndGenerateCaptions(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setCaptions(result.captions ?? []);
      setImageUrl(result.imageUrl ?? null);
    }

    setStep(null);
    setLoading(false);
  };

  return (
    <div>
      {/* File picker area */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-foreground/40 transition-colors mb-4"
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
              className="max-w-xs max-h-48 rounded-lg"
            />
            <p className="text-sm opacity-60">{fileName} · Click to change</p>
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
        <div className="mt-6 border rounded-xl p-4">
          <p className="text-sm font-medium mb-2">Uploaded image</p>
          <img
            src={imageUrl}
            alt="Uploaded"
            className="max-w-sm max-h-64 rounded-lg"
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
                className="border rounded-xl p-4 hover:border-foreground/30 transition-colors"
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
