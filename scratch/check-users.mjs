import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await client.connect();
  const users = await client.query(`
    SELECT id, name, email, role, "walletBalance"
    FROM "user";
  `);
  console.log("Users in DB:");
  console.table(users.rows);
  await client.end();
}

main().catch(err => {
  console.error("DB error:", err);
  process.exit(1);
});
