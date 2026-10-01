const SUPABASE_URL =
  "https://zgfnfulcsebqfcnkmijf.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_A0rFdnpY_8DmQWM5raDQeA_JWFOf89T";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
 );
