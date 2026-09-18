import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCurrentAdminProfile, getAdminSession, onAdminAuthStateChange, signInAdminWithPassword, signOutAdmin } from '../lib/adminAuth';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  async function resolveAdminAccess(nextSession) {
    if (!nextSession?.user?.id) {
      setAdminProfile(null);
      return;
    }

    const { profile } = await fetchCurrentAdminProfile(nextSession.user.id, nextSession.user.email);

    if (profile && profile.active && profile.role === 'admin') {
      setAdminProfile(profile);
      setAuthError('');
      return;
    }

    setAdminProfile(null);
    setAuthError('You are signed in, but this account is not authorized to access the admin console.');
    await signOutAdmin();
  }

  // Re-read session from getAdminSession (picks up localStorage demo sessions too)
  const refreshSession = useCallback(async () => {
    try {
      const { data } = await getAdminSession();
      const nextSession = data.session ?? null;
      setSession(nextSession);
      await resolveAdminAccess(nextSession);
    } catch {
      setSession(null);
      setAdminProfile(null);
    }
  }, []);

  // Wraps signInAdminWithPassword and refreshes React state on success
  const signIn = useCallback(async (email, password) => {
    const result = await signInAdminWithPassword(email, password);
    if (!result.error) {
      await refreshSession();
    }
    return result;
  }, [refreshSession]);

  // Wraps signOutAdmin and clears React state
  const signOut = useCallback(async () => {
    const result = await signOutAdmin();
    setSession(null);
    setAdminProfile(null);
    return result;
  }, []);

  useEffect(() => {
    let isMounted = true;

    getAdminSession()
      .then(({ data }) => {
        const nextSession = data.session ?? null;

        if (isMounted) {
          setSession(nextSession);
        }

        return resolveAdminAccess(nextSession);
      })
      .catch(() => {
        if (isMounted) {
          setSession(null);
          setAdminProfile(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    const { data: subscription } = onAdminAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setIsLoading(true);

      resolveAdminAccess(nextSession ?? null).finally(() => {
        setIsLoading(false);
      });
    });

    return () => {
      isMounted = false;
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      adminProfile,
      isLoading,
      isAuthenticated: Boolean(session),
      isAuthorizedAdmin: Boolean(adminProfile && adminProfile.active && adminProfile.role === 'admin'),
      authError,
      clearAuthError: () => setAuthError(''),
      signIn,
      signOut,
    }),
    [session, adminProfile, isLoading, authError, signIn, signOut]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }

  return context;
}