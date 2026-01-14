// backend/src/config/supabaseClient.js
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// ✅ Load .env file for standalone script execution
// (Server mode already loads it in index.js, but this ensures compatibility)
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// ✅ Better error message with troubleshooting info
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase Configuration Error');
  console.error('Missing environment variables:');
  console.error('  SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
  console.error('  SUPABASE_ANON_KEY (fallback):', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  console.error('\nPlease check your .env file in the backend folder.');
  throw new Error('Missing required Supabase environment variables');
}

// ✅ Create Supabase client with service role key (backend only)
// Service role key bypasses RLS policies - only use on backend
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// ✅ Log successful initialization (development only)
if (process.env.NODE_ENV === 'development') {
  console.log('✅ Supabase client initialized');
}

module.exports = supabase;