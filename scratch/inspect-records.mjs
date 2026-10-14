import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await client.connect();

  const articles = await client.query('SELECT id, title, slug, price, "createdAt" FROM "article" LIMIT 20;');
  console.log("=== DB ARTICLES ===");
  console.table(articles.rows);

  const transactions = await client.query('SELECT * FROM "wallet_transaction" LIMIT 20;');
  console.log("=== DB WALLET TRANSACTIONS ===");
  console.table(transactions.rows);

  const purchases = await client.query('SELECT * FROM "purchase" LIMIT 20;');
  console.log("=== DB PURCHASES ===");
  console.table(purchases.rows);

  await client.end();
}

main().catch(err => {
  console.error("DB error:", err);
  process.exit(1);
});
