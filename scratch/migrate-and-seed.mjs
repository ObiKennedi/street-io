import pg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await client.connect();
  console.log("Connected to PostgreSQL.");

  // 1. Categories
  console.log("Seeding categories...");
  const catContent = fs.readFileSync(path.resolve("component/dashboard/categories.config.ts"), "utf-8");
  const catStart = catContent.indexOf("export const exploreCategories: DashboardCategory[] = [");
  const catEnd = catContent.indexOf("];\n\n// Alias for backward compatibility", catStart);
  const rawCats = catContent.slice(catStart + "export const exploreCategories: DashboardCategory[] = [".length, catEnd);
  const categories = eval(`[${rawCats}]`);

  for (const c of categories) {
    await client.query(`
      INSERT INTO "category" ("id", "name", "slug", "description", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT ("slug") DO UPDATE 
      SET "name" = EXCLUDED."name", "description" = EXCLUDED."description", "updatedAt" = NOW();
    `, [`cat-${c.slug}`, c.label, c.slug, c.description || null]);
  }
  console.log(`Seeded ${categories.length} categories.`);

  // 2. Articles
  console.log("Seeding articles...");
  const artContent = fs.readFileSync(path.resolve("lib/articles.ts"), "utf-8");
  const artStart = artContent.indexOf("export const ARTICLES_DATABASE: Article[] = [");
  const artEnd = artContent.indexOf("];\n\nexport function", artStart);
  const rawArts = artContent.slice(artStart + "export const ARTICLES_DATABASE: Article[] = [".length, artEnd);
  const articles = eval(`[${rawArts}]`);

  for (const a of articles) {
    const numericPrice = parseInt(a.price.replace(/[^0-9]/g, ""), 10) || 3500;
    
    // Find category ID
    const catRes = await client.query(`SELECT id FROM "category" WHERE slug = $1;`, [a.categorySlug]);
    const catId = catRes.rows[0]?.id || null;

    await client.query(`
      INSERT INTO "article" (
        "id", "slug", "title", "description", "content", "contentSnippet",
        "price", "readTime", "published", "status", "categoryId", "categorySlug",
        "keyTakeaways", "tags", "weeklyReads", "monthlyReads", "totalReads",
        "trendingDelta", "soldCopies", "revenueGenerated", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, true, 'published', $9, $10,
        $11, $12, $13, $14, $15,
        $16, 0, 0, NOW(), NOW()
      )
      ON CONFLICT ("slug") DO UPDATE SET
        "title" = EXCLUDED."title",
        "description" = EXCLUDED."description",
        "content" = EXCLUDED."content",
        "contentSnippet" = EXCLUDED."contentSnippet",
        "price" = EXCLUDED."price",
        "readTime" = EXCLUDED."readTime",
        "categoryId" = EXCLUDED."categoryId",
        "categorySlug" = EXCLUDED."categorySlug",
        "keyTakeaways" = EXCLUDED."keyTakeaways",
        "tags" = EXCLUDED."tags",
        "weeklyReads" = EXCLUDED."weeklyReads",
        "monthlyReads" = EXCLUDED."monthlyReads",
        "totalReads" = EXCLUDED."totalReads",
        "trendingDelta" = EXCLUDED."trendingDelta",
        "updatedAt" = NOW();
    `, [
      a.id,
      a.slug,
      a.title,
      a.description,
      a.contentSnippet, // fallback full content
      a.contentSnippet,
      numericPrice,
      a.readTime,
      catId,
      a.categorySlug,
      a.keyTakeaways || [],
      a.tags || [],
      a.weeklyReads || 0,
      a.monthlyReads || 0,
      a.totalReads || 0,
      a.trendingDelta || null,
    ]);
  }

  const artCount = await client.query(`SELECT count(*) FROM "article";`);
  const catCount = await client.query(`SELECT count(*) FROM "category";`);
  console.log(`\nMigration & Seed Complete!`);
  console.log(`Total Categories in PostgreSQL: ${catCount.rows[0].count}`);
  console.log(`Total Articles in PostgreSQL: ${artCount.rows[0].count}`);

  await client.end();
}

main().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
