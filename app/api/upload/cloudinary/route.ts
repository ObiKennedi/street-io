// File: app/api/upload/cloudinary/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

// Fallback helper: converts file to a persistent base64 data URL
// Never relies on serverless ephemeral disks (/public/uploads) which vanish between requests
async function createBase64Fallback(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const mime = file.type || "image/jpeg";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

export async function POST(req: Request) {
  let file: File | null = null;

  try {
    const formData = await req.formData();
    file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided in request." },
        { status: 400 }
      );
    }

    // Validate mime type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files (JPEG, PNG, WebP, GIF, etc.) are supported." },
        { status: 400 }
      );
    }

    console.log(
      `[Upload] Received image: "${file.name}", size: ${(file.size / 1024).toFixed(1)} KB, type: ${file.type}`
    );

    // Extract Cloudinary config from env
    let cloudName =
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      "";
    let apiKey = process.env.CLOUDINARY_API_KEY || "";
    let apiSecret = process.env.CLOUDINARY_API_SECRET || "";
    let uploadPreset =
      process.env.CLOUDINARY_UPLOAD_PRESET ||
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
      "";

    // If preset was mistakenly set to a CLOUDINARY_URL string, clean it
    if (uploadPreset.startsWith("CLOUDINARY_URL=")) {
      process.env.CLOUDINARY_URL = uploadPreset.replace(/^CLOUDINARY_URL=/, "");
      uploadPreset = "";
    }

    // Parse CLOUDINARY_URL if provided
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    if (cloudinaryUrl && (!cloudName || !apiKey || !apiSecret)) {
      const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
      if (match) {
        apiKey = apiKey || match[1];
        apiSecret = apiSecret || match[2];
        cloudName = cloudName || match[3];
      }
    }

    const hasSignedConfig = Boolean(cloudName && apiKey && apiSecret);
    const hasPresetConfig = Boolean(cloudName && uploadPreset);

    // If Cloudinary credentials are not configured, fallback safely to base64 data URL
    if (!hasSignedConfig && !hasPresetConfig) {
      console.warn("[Upload] Cloudinary config missing; using base64 data URL storage.");
      const dataUrl = await createBase64Fallback(file);
      return NextResponse.json({
        success: true,
        url: dataUrl,
        publicId: "base64_" + Date.now(),
      });
    }

    // Attempt Cloudinary upload
    try {
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", file);
      const folder = (formData.get("folder") as string) || "streetio_receipts";

      if (hasSignedConfig) {
        const timestamp = Math.floor(Date.now() / 1000);
        // Signature string parameters must be sorted alphabetically: folder, timestamp
        const strToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash("sha1").update(strToSign).digest("hex");

        cloudinaryFormData.append("api_key", apiKey);
        cloudinaryFormData.append("timestamp", String(timestamp));
        cloudinaryFormData.append("folder", folder);
        cloudinaryFormData.append("signature", signature);
      } else {
        cloudinaryFormData.append("upload_preset", uploadPreset);
        cloudinaryFormData.append("folder", folder);
      }

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: cloudinaryFormData,
        signal: AbortSignal.timeout(15000),
      });

      const data = await response.json();

      if (response.ok && (data.secure_url || data.url)) {
        return NextResponse.json({
          success: true,
          url: data.secure_url || data.url,
          publicId: data.public_id,
          width: data.width,
          height: data.height,
          format: data.format,
        });
      }

      console.warn("[Upload] Cloudinary upload returned error, falling back to base64:", data);
    } catch (cloudErr) {
      console.warn("[Upload] Cloudinary fetch error, falling back to base64:", cloudErr);
    }

    // Fallback: Return self-contained base64 data URL (bulletproof on serverless)
    const fallbackUrl = await createBase64Fallback(file);
    return NextResponse.json({
      success: true,
      url: fallbackUrl,
      publicId: "base64_" + Date.now(),
    });
  } catch (err: unknown) {
    console.error("[Upload] Fatal error in upload route:", err);

    // If we have the file, return base64 before failing
    if (file) {
      try {
        const fallbackUrl = await createBase64Fallback(file);
        return NextResponse.json({
          success: true,
          url: fallbackUrl,
          publicId: "base64_" + Date.now(),
        });
      } catch {}
    }

    const message = err instanceof Error ? err.message : "Internal server error during upload.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
