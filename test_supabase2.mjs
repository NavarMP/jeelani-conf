import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://zagegwanajncpvfdrjlm.supabase.co'
const supabaseKey = 'sb_publishable_6gnuGT55nW2ytf7S8YE5kg_Xbgp9sKp'
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const { data, error } = await supabase.from('sessions').select('*, speakers!session_speakers(*)').order('start_time', { ascending: true })
  if (error) {
    console.log("Error:", error)
  } else {
    console.log("Success! Data length:", data.length)
  }
}
main()
