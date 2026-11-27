import type { Metadata } from "next";
import { NewArticlesFeed } from "@/component/dashboard";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ARTICLES_DATABASE, addArticle, mapDbArticleToArticle, type Article } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Latest Releases · streetio",
  description: "Browse the latest uploaded articles, field playbooks, and operational guides on Street IO.",
};

export const instant = false;

export default async function NewPage() {
  await requireSession("/new");

  let initialArticles: Article[] = [...ARTICLES_DATABASE];

  try {
    const dbArticles = await prisma.article.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    if (dbArticles.length > 0) {
      const mapped: Article[] = dbArticles.map(mapDbArticleToArticle);

      for (const item of mapped) {
        addArticle(item);
      }
      initialArticles = mapped;
    }
  } catch (err) {
    console.error("Prisma error fetching articles in /new:", err);
  }

  const publicArticles: Article[] = initialArticles.map(
    ({ content, link, tools, keyTakeaways, tags, ...preview }) => preview
  );

  return <NewArticlesFeed initialArticles={publicArticles} />;
}
