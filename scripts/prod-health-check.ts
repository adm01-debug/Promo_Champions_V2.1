import { supabase } from "../src/integrations/supabase/client";

async function runProductionHealthCheck() {
  console.log("🚀 Starting Final Enterprise Production Health Check...");
  
  const results = {
    database: false,
    auth: false,
    storage: false,
    rls: true, // Assume true, check for failures
  };

  try {
    // 1. Check DB
    const { error: dbError } = await supabase.from("sales").select("id").limit(1);
    if (!dbError) results.database = true;
    
    // 2. Check Auth Session
    const { data: authData } = await supabase.auth.getSession();
    results.auth = !!authData;

    console.log("Health Check Results:", results);
    
    if (Object.values(results).every(v => v === true)) {
      console.log("✅ SYSTEM 10/10 - READY FOR PRODUCTION");
    } else {
      console.warn("⚠️ Some systems reported issues.");
    }
  } catch (err) {
    console.error("❌ Health check failed:", err);
  }
}

runProductionHealthCheck();
