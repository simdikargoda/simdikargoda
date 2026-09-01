import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.storage.createBucket('avatars', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    fileSizeLimit: 2097152 // 2MB
  });

  if (error) {
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log("Bucket already exists. Updating it to be public...");
      await supabase.storage.updateBucket('avatars', { public: true });
    } else {
      console.error("Error creating bucket:", error);
      process.exit(1);
    }
  } else {
    console.log("Bucket created successfully:", data);
  }
}

main();
