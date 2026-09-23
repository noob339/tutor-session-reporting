import { createClient } from "@supabase/supabase-js";

// Access the client only when real database features are implemented.
// The preview views deliberately use sampleData.js even if credentials exist.
let client;

export function getDatabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (
    !url ||
    !key ||
    url.includes("your-project") ||
    key === "your-publishable-key"
  ) {
    return null;
  }
  client ??= createClient(url, key);
  return client;
}
