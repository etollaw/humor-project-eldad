import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const presignedUrl = formData.get("presignedUrl");
    const contentType = formData.get("contentType");
    const file = formData.get("file");

    if (typeof presignedUrl !== "string" || typeof contentType !== "string" || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing presignedUrl, contentType, or file." },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const uploadRes = await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: fileBuffer,
    });

    if (!uploadRes.ok) {
      return NextResponse.json(
        {
          error: `Step 2 upload failed (${uploadRes.status}): ${await uploadRes.text()}`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected upload proxy failure",
      },
      { status: 500 }
    );
  }
}
