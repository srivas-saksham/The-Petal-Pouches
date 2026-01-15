// backend/src/config/supabaseClient.js
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase Configuration Error');
  throw new Error('Missing required Supabase environment variables');
}

// ⭐ FIX: Add serverless-compatible configuration
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  // ⭐ NEW: Disable realtime for serverless
  realtime: {
    enabled: false
  },
  // ⭐ NEW: Configure fetch for Vercel serverless
  global: {
    fetch: (...args) => {
      return fetch(...args).catch(err => {
        console.error('Supabase fetch error:', err);
        throw err;
      });
    }
  },
  // ⭐ NEW: Connection pooling for serverless
  db: {
    schema: 'public'
  }
});

if (process.env.NODE_ENV === 'development') {
  console.log('✅ Supabase client initialized');
}

module.exports = supabase;