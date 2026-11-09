// File: lib/telegram.ts
// Telegram Alert Service for Admin Notifications on Street IO

export type TelegramAlertPayload = {
  text: string;
  photoUrl?: string;
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
    console.warn("Telegram alerts skipped: Bot token or Admin Chat ID not set.");
    return { success: false, error: "Missing bot credentials" };
  }

  try {
    // If a photoUrl is provided, attempt to send photo with caption first
    if (payload.photoUrl) {
      try {
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
          }
        );

        const photoData = await photoRes.json();
        if (photoData.ok) {
          return {
            success: true,
            messageId: photoData.result?.message_id,
          };
        }

        console.warn("Telegram sendPhoto response was not ok:", photoData);
      } catch (photoErr) {
        console.warn("Telegram sendPhoto failed, falling back to sendMessage:", photoErr);
      }
    }

    // Text message fallback or standard notification
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: payload.photoUrl
          ? `${payload.text}\n\n📎 <b>Receipt Link:</b> <a href="${payload.photoUrl}">View Uploaded Receipt</a>`
          : payload.text,
        parse_mode: payload.parseMode ?? "HTML",
        disable_web_page_preview: false,
      }),
    });

    const data = await res.json();
    if (data.ok) {
      return {
        success: true,
        messageId: data.result?.message_id,
      };
    }

    console.warn("Telegram sendMessage response was not ok:", data);
    return {
      success: false,
      error: data.description || "Failed to deliver Telegram notification",
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Network error contacting Telegram API";
    console.error("Telegram notification error:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

