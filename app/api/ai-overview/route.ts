// File: app/api/ai-overview/route.ts
import { NextResponse } from "next/server";
import { searchArticles, type Article } from "@/lib/articles";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = typeof body.query === "string" ? body.query.trim() : "";

    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const matchedArticles: Article[] = body.matchedArticles?.length
      ? body.matchedArticles
      : searchArticles(query);

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Live Gemini 2.0 Flash Integration if API key is present
    if (apiKey) {
      try {
        const articleContext = matchedArticles.length
          ? matchedArticles
              .slice(0, 4)
              .map(
                (a, i) =>
                  `[Guide ${i + 1}: ${a.title}]\nCategory: ${a.category}\nSummary: ${a.contentSnippet}\nTakeaways: ${a.keyTakeaways.join("; ")}`
              )
              .join("\n\n")
          : "No exact matches in database; provide authoritative street intelligence on this topic.";

        const prompt = `You are Street IO's operational intelligence engine. A user is searching for educational advice on: "${query}".

Reference guides from Street IO:
${articleContext}

Write a high-yield, structured AI Overview with:
- A direct 2-3 sentence executive breakdown explaining the core mechanics, risks, or strategy.
- 3 key tactical takeaways or red flags (bulleted with •).
- A concluding single-sentence practical rule of thumb.

Keep your tone direct, actionable, and clear. Avoid generic disclaimers or conversational filler.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 650,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const candidateText =
            data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (candidateText) {
            return NextResponse.json({
              overview: candidateText,
              source: "gemini-2.0-flash",
              hasKey: true,
            });
          }
        }
      } catch (geminiErr) {
        console.error("Gemini API call failed, using synthesized fallback:", geminiErr);
      }
    }

    // 2. High-quality curated synthesis fallback when key is not yet configured
    if (matchedArticles.length > 0) {
      const topArticle = matchedArticles[0];
      const allTakeaways = matchedArticles
        .flatMap((a) => a.keyTakeaways)
        .slice(0, 4);

      const synthesizedOverview = `**Core Analysis**: ${topArticle.description}

• ${allTakeaways[0] || "Verify authentic identities through independent, out-of-band communication channels."}
• ${allTakeaways[1] || "Never wire funds or release credentials based on emotional urgency or unvetted demands."}
• ${allTakeaways[2] || "Cross-examine metadata, check domain age via WHOIS, and archive timestamped evidence."}
${allTakeaways[3] ? `• ${allTakeaways[3]}` : ""}

**Rule of Thumb**: When pressure is applied to act fast or circumvent standard procedures, assume active manipulation until verified.`;

      return NextResponse.json({
        overview: synthesizedOverview,
        source: "curated-synthesis",
        hasKey: false,
      });
    }

    // General fallback for unknown query
    const generalOverview = `**Operational Overview for "${query}"**:
While an exact match was not found in our catalog, practical risk-mitigation follows universal fundamentals:

• **Establish Verification**: Independently confirm claims using authoritative sources outside of initial communication.
• **Contain Exposure**: Never transmit unverified funds, personal identifiers, or sensitive credentials.
• **Document Interactions**: Maintain strict chronological records of messages, transaction IDs, and sender details.

**Rule of Thumb**: Verify first through trusted protocols before committing capital, access, or reputation.`;

    return NextResponse.json({
      overview: generalOverview,
      source: "curated-synthesis",
      hasKey: false,
    });
  } catch (err) {
    console.error("Search/AI Overview error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
