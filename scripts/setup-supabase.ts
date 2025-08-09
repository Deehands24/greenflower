import { Client } from "pg"

async function setupSupabase() {
  // Use your non-pooling connection for DDL operations
  const connectionString = process.env.SUPABASE_POSTGRES_URL_NON_POOLING || process.env.SUPABASE_POSTGRES_URL

  if (!connectionString) {
    throw new Error(
      "Missing Supabase Postgres connection string. Check SUPABASE_POSTGRES_URL_NON_POOLING or SUPABASE_POSTGRES_URL.",
    )
  }

  const client = new Client({ connectionString })

  try {
    await client.connect()
    console.log("✅ Connected to Supabase Postgres")

    // Create the app_state table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS app_state (
        project_id TEXT PRIMARY KEY,
        state JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `

    await client.query(createTableQuery)
    console.log("✅ Created app_state table")

    // Create an index on updated_at for performance
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_app_state_updated_at 
      ON app_state(updated_at DESC);
    `

    await client.query(createIndexQuery)
    console.log("✅ Created index on updated_at")

    console.log("🎉 Supabase setup complete!")
  } catch (error) {
    console.error("❌ Setup failed:", error)
    throw error
  } finally {
    await client.end()
  }
}

setupSupabase().catch(console.error)
