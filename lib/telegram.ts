// File: lib/telegram.ts
// Telegram Alert Service for Admin Notifications on Street IO

import fs from "fs/promises";
import path from "path";

export type TelegramAlertPayload = {
  text: string;
  photoUrl?: string;
  photoBuffer?: Buffer;
  mimeType?: string;
  parseMode?: "HTML" | "Markdown" | "MarkdownV2";
};

export async function sendTelegramNotification(payload: TelegramAlertPayload): Promise<{
  success: boolean;
  messageId?: number;
  error?: string;
}> {
  const token =
    process.env.TELEGRAM_BOT_TOKEN ||
    "9038619284:AAGOptwC_Tcm2Hy41boAqp1XjCtSy_44MIs";
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID || "5055261566";

  if (!token || !chatId) {
    console.warn("[Telegram] Notification skipped: Bot token or Admin Chat ID not set.");
    return { success: false, error: "Missing bot credentials" };
  }

  // 1. Attempt to send Photo if photoUrl or photoBuffer is provided
  if (payload.photoBuffer || payload.photoUrl) {
    try {
      let imageBlob: Blob | null = null;
      let filename = "receipt.jpg";

      if (payload.photoBuffer) {
        imageBlob = new Blob([new Uint8Array(payload.photoBuffer)], {
          type: payload.mimeType || "image/jpeg",
        });
      } else if (payload.photoUrl) {
        const pUrl = payload.photoUrl;

        // Base64 data URL
        if (pUrl.startsWith("data:")) {
          const matches = pUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) {
            const mime = matches[1];
            const buffer = Buffer.from(matches[2], "base64");
            imageBlob = new Blob([new Uint8Array(buffer)], { type: mime });
            filename = `receipt.${mime.split("/")[1] || "jpg"}`;
          }
        }
        // Local public file URL (e.g. /uploads/receipts/...)
        else if (pUrl.startsWith("/uploads/") || pUrl.startsWith("/public/")) {
          try {
            const cleanPath = pUrl.replace(/^\//, "");
            const fullLocalPath = path.join(process.cwd(), "public", cleanPath.replace(/^uploads\//, "uploads/"));
            const buffer = await fs.readFile(fullLocalPath);
            imageBlob = new Blob([new Uint8Array(buffer)], { type: "image/jpeg" });
          } catch (localReadErr) {
            console.warn("[Telegram] Could not read local photo file:", localReadErr);
          }
        }
        // Remote HTTP/HTTPS URL
        else if (pUrl.startsWith("http://") || pUrl.startsWith("https://")) {
          try {
            const fetchRes = await fetch(pUrl, {
              signal: AbortSignal.timeout(8000),
            });
            if (fetchRes.ok) {
              const arrayBuffer = await fetchRes.arrayBuffer();
              const cType = fetchRes.headers.get("content-type") || "image/jpeg";
              imageBlob = new Blob([arrayBuffer], { type: cType });
            }
          } catch (remoteFetchErr) {
            console.warn("[Telegram] Could not fetch remote photo to attach directly:", remoteFetchErr);
          }
        }
      }

      // If we have an image Blob, send as multipart/form-data
      if (imageBlob) {
        const formData = new FormData();
        formData.append("chat_id", chatId);
        formData.append("caption", payload.text);
        formData.append("parse_mode", payload.parseMode ?? "HTML");
        formData.append("photo", imageBlob, filename);

        const photoRes = await fetch(
          `https://api.telegram.org/bot${token}/sendPhoto`,
          {
            method: "POST",
            body: formData,
            signal: AbortSignal.timeout(20000),
          }
        );

        const photoData = await photoRes.json();
        if (photoData.ok) {
          console.log("[Telegram] sendPhoto delivered successfully. Message ID:", photoData.result?.message_id);
          return {
            success: true,
            messageId: photoData.result?.message_id,
          };
        }

        console.warn("[Telegram] sendPhoto multipart failed:", photoData);
      } else if (payload.photoUrl && (payload.photoUrl.startsWith("http://") || payload.photoUrl.startsWith("https://"))) {
        // Fallback: send photo by public URL
        const photoRes = await fetch(
          `https://api.telegram.org/bot${token}/sendPhoto`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              photo: payload.photoUrl,
              caption: payload.text,
              parse_mode: payload.parseMode ?? "HTML",
            }),
            signal: AbortSignal.timeout(20000),
          }
        );

        const photoData = await photoRes.json();
        if (photoData.ok) {
          console.log("[Telegram] sendPhoto by URL delivered. Message ID:", photoData.result?.message_id);
          return {
            success: true,
            messageId: photoData.result?.message_id,
          };
        }

        console.warn("[Telegram] sendPhoto URL failed:", photoData);
      }
    } catch (photoErr) {
      console.warn("[Telegram] Photo delivery error, proceeding to text message:", photoErr);
    }
  }

  // 2. Text message fallback or standard notification
  try {
    const textToSend = payload.photoUrl && (payload.photoUrl.startsWith("http://") || payload.photoUrl.startsWith("https://"))
      ? `${payload.text}\n\n📎 <b>Receipt Link:</b> <a href="${payload.photoUrl}">View Uploaded Slip</a>`
      : payload.text;

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: textToSend,
        parse_mode: payload.parseMode ?? "HTML",
        disable_web_page_preview: false,
      }),
      signal: AbortSignal.timeout(20000),
    });

    const data = await res.json();
    if (data.ok) {
      console.log("[Telegram] sendMessage delivered successfully. Message ID:", data.result?.message_id);
      return {
        success: true,
        messageId: data.result?.message_id,
      };
    }

    console.error("[Telegram] sendMessage returned error:", data);
    return {
      success: false,
      error: data.description || "Failed to deliver Telegram notification",
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Network error contacting Telegram API";
    console.error("[Telegram] Fatal notification error:", errorMsg);
    return { success: false, error: errorMsg };
  }
}
