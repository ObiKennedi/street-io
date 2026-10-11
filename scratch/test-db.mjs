import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await client.connect();
  const res = await client.query("SELECT current_database(), current_user;");
  console.log("DB connected successfully:", res.rows[0]);
  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
  `);
  console.log("Existing tables:", tables.rows.map(r => r.table_name));
  await client.end();
}

main().catch(err => {
  console.error("DB error:", err);
  process.exit(1);
});
