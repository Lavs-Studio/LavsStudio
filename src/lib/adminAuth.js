import { supabase, isSupabaseConfigured } from './supabase';

export async function signInAdminWithPassword(email, password) {
  if (!supabase || !isSupabaseConfigured) {
    return {
      data: null,
      error: { message: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.' },
    };
  }

  try {
    return await supabase.auth.signInWithPassword({ email, password });
  } catch (err) {
    return { data: null, error: { message: err?.message || 'Failed to sign in.' } };
  }
}

export async function signOutAdmin() {
  if (!supabase || !isSupabaseConfigured) return { error: null };
  return supabase.auth.signOut();
}

export async function getAdminSession() {
  if (!supabase || !isSupabaseConfigured) {
    return { data: { session: null }, error: null };
  }
  return supabase.auth.getSession();
}

export function onAdminAuthStateChange(callback) {
  if (!supabase || !isSupabaseConfigured) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return supabase.auth.onAuthStateChange(callback);
}

export async function fetchCurrentAdminProfile(userId, userEmail = '') {
  if (!supabase || !isSupabaseConfigured) {
    return { profile: null, error: new Error('Supabase not configured') };
  }

  try {
    // 1. Try fetching by user_id
    const { data: profileByUid } = await supabase
      .from('admin_profiles')
      .select('user_id, full_name, email, role, active')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileByUid) {
      return { profile: profileByUid, error: null };
    }

    // 2. Try fetching by email if available
    if (userEmail) {
      const { data: profileByEmail } = await supabase
        .from('admin_profiles')
        .select('user_id, full_name, email, role, active')
        .eq('email', userEmail)
        .maybeSingle();

      if (profileByEmail) {
        // Link user_id if it wasn't set yet
        await supabase
          .from('admin_profiles')
          .update({ user_id: userId })
          .eq('email', userEmail);

        return { profile: { ...profileByEmail, user_id: userId }, error: null };
      }
    }

    // 3. Fallback: Any authenticated user in Supabase Auth is an authorized admin
    const newAdminProfile = {
      user_id: userId,
      email: userEmail || 'admin@lavsstudio.com',
      full_name: userEmail ? userEmail.split('@')[0] : 'Admin',
      role: 'admin',
      active: true,
    };

    // Attempt to persist in admin_profiles table
    await supabase.from('admin_profiles').upsert(newAdminProfile, { onConflict: 'user_id' });

    return { profile: newAdminProfile, error: null };
  } catch (err) {
    // Even if database query throws, allow the authenticated Supabase user
    return {
      profile: {
        user_id: userId,
        email: userEmail || 'admin@lavsstudio.com',
        full_name: 'Admin',
        role: 'admin',
        active: true,
      },
      error: null,
    };
  }
}