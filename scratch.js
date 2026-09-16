import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function testInsert() {
  const { data, error } = await supabase
    .from("speakers")
    .insert({
      name: "Test Guest",
      slug: "test-guest-" + Date.now(),
      title: "Guest",
      bio: "",
      order_index: 1,
    })
    .select()
    .single();
  console.log("Error:", error);
  console.log("Data:", data);
}

testInsert();
