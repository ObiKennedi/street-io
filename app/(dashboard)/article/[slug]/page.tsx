// File: app/(dashboard)/article/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { ARTICLES_DATABASE, getArticleBySlug, addArticle, type Article } from "@/lib/articles";
import { getToolsForArticle } from "@/lib/article-tools";
import { isArticleUnlockedForUser } from "@/lib/paga";
import { resolveUserWalletState } from "@/lib/manual-payments";
import { ArticleDetailView } from "@/component/dashboard/ArticleDetailView";
import { prisma } from "@/lib/prisma";
import { exploreCategories } from "@/component/dashboard/categories.config";

type Props = {
  params: Promise<{ slug: string }>;
};

export const instant = false;

async function resolveArticle(slug: string): Promise<Article | undefined> {
  const clean = slug?.trim()?.toLowerCase();
  if (!clean) return undefined;

  // 1. Check in-memory database first
  const memoryFound = ARTICLES_DATABASE?.find(
    (a) => a.slug.toLowerCase() === clean || a.id.toLowerCase() === clean
  );
  if (memoryFound) return memoryFound;

  if (typeof getArticleBySlug === "function") {
    try {
      const found = getArticleBySlug(slug);
      if (found) return found;
    } catch {}
  }

  // 2. Query Prisma database directly so published articles resolve reliably on the server
  try {
    const dbArticle = await prisma.article.findFirst({
      where: {
        OR: [
          { slug: clean },
          { id: clean },
          { slug: slug },
          { id: slug },
        ],
      },
    });

    if (dbArticle) {
      const formattedPrice =
        typeof dbArticle.price === "number"
          ? `₦${dbArticle.price.toLocaleString()}`
          : String(dbArticle.price);

      const catConfig = exploreCategories.find((c) => c.slug === dbArticle.categorySlug);
      const categoryLabel = catConfig
        ? catConfig.label
        : dbArticle.categorySlug
        ? dbArticle.categorySlug.toUpperCase()
        : "GENERAL";

      // Extract tools from dbArticle.keyTakeaways
      const parsedTools: any[] = [];
      if (Array.isArray(dbArticle.keyTakeaways)) {
        for (const item of dbArticle.keyTakeaways) {
          try {
            if (item.startsWith("{") && item.includes('"url"')) {
              const parsed = JSON.parse(item);
              if (parsed && parsed.url) parsedTools.push(parsed);
            }
          } catch {}
        }
      }

      // Extract link from dbArticle.tags
      let dbLink = `/article/${dbArticle.slug}`;
      if (Array.isArray(dbArticle.tags)) {
        const linkTag = dbArticle.tags.find((t) => t.startsWith("link:"));
        if (linkTag) {
          dbLink = linkTag.replace(/^link:/, "");
        }
      }
      if (parsedTools.length > 0 && !dbLink.startsWith("http")) {
        dbLink = parsedTools[0].url;
      }

      const articleObj: Article = {
        id: dbArticle.id,
        slug: dbArticle.slug,
        title: dbArticle.title,
        category: categoryLabel,
        categorySlug: dbArticle.categorySlug || "general",
        price: formattedPrice,
        readTime: dbArticle.readTime || "7 min read",
        description: dbArticle.description || "",
        link: dbLink,
        content: dbArticle.content,
        contentSnippet: dbArticle.contentSnippet || "",
        keyTakeaways: dbArticle.keyTakeaways || [],
        tags: dbArticle.tags || [],
        weeklyReads: dbArticle.weeklyReads || 0,
        monthlyReads: dbArticle.monthlyReads || 0,
        totalReads: dbArticle.totalReads || 0,
        trendingDelta: dbArticle.trendingDelta || "+100%",
        thumbnailUrl: dbArticle.coverImage || undefined,
        tools: parsedTools.length > 0 ? parsedTools : undefined,
      };

      addArticle(articleObj);
      return articleObj;
    }
  } catch (err) {
    console.error("Prisma error in resolveArticle:", err);
  }

  return undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await resolveArticle(slug);

  if (!article) {
    return {
      title: "Article Not Found · streetio",
    };
  }

  return {
    title: `${article.title} · streetio`,
    description: article.description,
  };
}

export default async function ArticleMicroPage({ params }: Props) {
  const { slug } = await params;
  const session = await getSession();

  const article = await resolveArticle(slug);
  if (!article) {
    notFound();
  }

  // Authoritative tools resolution:
  // 1. If the article has uploaded tools, use them!
  // 2. If the article has an external link uploaded by admin, use it as the tool!
  // 3. If it's a custom uploaded article without tools/link, keep tools empty (never show fake catfish tools!).
  // 4. Only for legacy pre-seeded demo articles, fall back to getToolsForArticle.
  const tools =
    article.tools && article.tools.length > 0
      ? article.tools
      : article.link && (article.link.startsWith("http://") || article.link.startsWith("https://"))
      ? [
          {
            id: `tool-${article.slug}`,
            name: `${article.title} Tool`,
            description: article.description || "Operational tool and verification link.",
            category: "Operational Tool",
            type: "Verification" as const,
            url: article.link,
            isExternal: true,
            badge: "Uploaded Tool",
          },
        ]
      : article.id?.startsWith("art-custom") ||
        article.slug?.startsWith("art-custom") ||
        article.slug?.startsWith("article-")
      ? []
      : getToolsForArticle(article.categorySlug || "general");

  const walletState = session?.user?.id
    ? await resolveUserWalletState(session.user.id, session.user.email)
    : null;

  const isUnlocked = session?.user?.id
    ? (Boolean(walletState?.unlockedSlugs.includes(article.slug.toLowerCase())) ||
        isArticleUnlockedForUser(session.user.id, article.slug))
    : false;

  const walletBalance = walletState ? walletState.balance : 0;

  // Never expose tool links, external URLs, or full article content to unpaid users
  const safeArticle: Article = isUnlocked
    ? article
    : {
        ...article,
        content: undefined,
        link: undefined,
        tools: undefined,
        keyTakeaways: [],
        tags: [],
      };

  return (
    <ArticleDetailView
      article={safeArticle}
      tools={isUnlocked ? tools : []}
      initialIsUnlocked={isUnlocked}
      userWalletBalance={walletBalance}
    />
  );
}
