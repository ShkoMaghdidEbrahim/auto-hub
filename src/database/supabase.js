import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getCurrentUser = async () => {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
};

export const getCurrentSession = async () => {
  const {
    data: { session }
  } = await supabase.auth.getSession();
  return session;
};

export const signOut = async () => {
  await supabase.auth.signOut();
  localStorage.removeItem('authentication');
};

export const verifyAuthentication = async () => {
  const user = await getCurrentUser();

  if (!user) {
    await signOut();
    return false;
  }

  return true;
};
