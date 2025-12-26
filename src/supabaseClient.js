import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client that returns empty results when env vars are missing
const createMockClient = () => {
  const mockResponse = { data: null, error: { message: 'Supabase not configured' } };
  const mockQuery = () => ({
    select: () => mockQuery(),
    insert: () => mockQuery(),
    update: () => mockQuery(),
    delete: () => mockQuery(),
    eq: () => mockQuery(),
    order: () => mockQuery(),
    limit: () => mockQuery(),
    single: () => Promise.resolve(mockResponse),
    then: (resolve) => resolve(mockResponse),
  });

  return {
    from: () => mockQuery(),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signIn: () => Promise.resolve(mockResponse),
      signOut: () => Promise.resolve({ error: null }),
    },
  };
};

let supabase;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables - using mock client');
  supabase = createMockClient();
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
export default supabase;
