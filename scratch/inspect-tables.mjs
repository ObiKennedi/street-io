import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await client.connect();
  const tables = ['user', 'article', 'category', 'purchase', 'wallet_transaction'];
  for (const t of tables) {
    const cols = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = $1
      ORDER BY ordinal_position;
    `, [t]);
    console.log(`\n--- TABLE: ${t} ---`);
    console.table(cols.rows);

    const countRes = await client.query(`SELECT count(*) FROM "${t}";`);
    console.log(`Row count for ${t}:`, countRes.rows[0].count);
  }
  await client.end();
}

main().catch(err => {
  console.error("DB error:", err);
  process.exit(1);
});
