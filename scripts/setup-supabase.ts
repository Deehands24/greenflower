import { createClient } from "@supabase/supabase-js"

async function setupSupabase() {
  const supabaseUrl = process.env.SUPABASE_SUPABASE_URL || process.env.SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables")
    console.log("Required variables:")
    console.log("- SUPABASE_SUPABASE_URL or SUPABASE_NEXT_PUBLIC_SUPABASE_URL")
    console.log("- SUPABASE_SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_ROLE_KEY")
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log("Creating app_state table...")

    const { error } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS app_state (
          id TEXT PRIMARY KEY,
          app_state_data JSONB NOT NULL, -- Renamed column to app_state_data
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';
        
        DROP TRIGGER IF EXISTS update_app_state_updated_at ON app_state;
        CREATE TRIGGER update_app_state_updated_at
          BEFORE UPDATE ON app_state
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `,
    })

    if (error) {
      console.error("Failed to create table via RPC, trying direct SQL...")

      // Fallback: try creating table directly
      const { error: createError } = await supabase.from("app_state").select("id").limit(1)

      if (createError && createError.code === "42P01") {
        console.log("Table does not exist. Please run this SQL in your Supabase SQL Editor:")
        console.log(`
CREATE TABLE IF NOT EXISTS app_state (
  id TEXT PRIMARY KEY,
  app_state_data JSONB NOT NULL, -- Renamed column to app_state_data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_app_state_updated_at ON app_state;
CREATE TRIGGER update_app_state_updated_at
  BEFORE UPDATE ON app_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
        `)
        return
      }
    }

    console.log("✅ Supabase setup completed successfully!")
    console.log('Table "app_state" is ready to use with "app_state_data" column.')

    // Test the connection
    const { data, error: testError } = await supabase.from("app_state").select("count").limit(1)

    if (testError && testError.code !== "PGRST116") {
      console.error("Connection test failed:", testError)
    } else {
      console.log("✅ Connection test passed!")
    }
  } catch (error) {
    console.error("Setup failed:", error)
  }
}

setupSupabase()
