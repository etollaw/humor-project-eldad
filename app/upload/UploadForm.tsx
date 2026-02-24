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
      <div className="mb-6">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
          onChange={handleFileChange}
          className="block mb-3"
        />

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="max-w-sm max-h-64 rounded border mb-3"
          />
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="border rounded px-4 py-2 hover:opacity-80 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Upload & Generate Captions"}
        </button>
      </div>

      {step && <p className="text-sm opacity-70 mb-4">{step}</p>}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {imageUrl && (
        <div className="mb-4">
          <p className="text-sm opacity-70 mb-1">Uploaded image:</p>
          <img
            src={imageUrl}
            alt="Uploaded"
            className="max-w-sm max-h-64 rounded border"
          />
        </div>
      )}

      {captions.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-3">
            Generated Captions ({captions.length})
          </h2>
          <ul className="space-y-2">
            {captions.map((c, i) => (
              <li key={c.id ?? i} className="border rounded-lg p-3">
                <p>{c.content ?? JSON.stringify(c)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
