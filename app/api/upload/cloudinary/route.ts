// File: app/api/upload/cloudinary/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

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

    // Limit to 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 10MB limit." },
        { status: 400 }
      );
    }

    // Extract Cloudinary config from env
    let cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
    let apiKey = process.env.CLOUDINARY_API_KEY || "";
    let apiSecret = process.env.CLOUDINARY_API_SECRET || "";
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

    // Parse CLOUDINARY_URL if provided (cloudinary://API_KEY:API_SECRET@CLOUD_NAME)
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    if (cloudinaryUrl && (!cloudName || !apiKey || !apiSecret)) {
      const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
      if (match) {
        apiKey = apiKey || match[1];
        apiSecret = apiSecret || match[2];
        cloudName = cloudName || match[3];
      }
    }

    // Check if Cloudinary is configured
    const hasSignedConfig = Boolean(cloudName && apiKey && apiSecret);
    const hasPresetConfig = Boolean(cloudName && uploadPreset);

    if (!hasSignedConfig && !hasPresetConfig) {
      return NextResponse.json(
        {
          error:
            "Cloudinary credentials are not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.",
          missingConfig: true,
        },
        { status: 400 }
      );
    }

    // Prepare upload payload to Cloudinary REST API
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);

    const folder = (formData.get("folder") as string) || "streetio_articles";

    if (hasSignedConfig) {
      const timestamp = Math.floor(Date.now() / 1000);
      // Alphabetical order of params for Cloudinary signature
      const strToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(strToSign).digest("hex");

      cloudinaryFormData.append("api_key", apiKey);
      cloudinaryFormData.append("timestamp", String(timestamp));
      cloudinaryFormData.append("folder", folder);
      cloudinaryFormData.append("signature", signature);
    } else {
      // Unsigned upload preset
      cloudinaryFormData.append("upload_preset", uploadPreset);
      cloudinaryFormData.append("folder", folder);
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: cloudinaryFormData,
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return NextResponse.json(
        { error: data.error?.message || "Failed to upload image to Cloudinary." },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: data.secure_url || data.url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error during upload.";
    console.error("Cloudinary upload error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
