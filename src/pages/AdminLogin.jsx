import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../admin/AdminAuthProvider';
import { isSupabaseConfigured } from '../lib/supabase';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, isAuthorizedAdmin, signIn, authError, clearAuthError } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isAuthorizedAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthorizedAdmin, navigate]);

  if (!isLoading && isAuthenticated && isAuthorizedAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    clearAuthError();
    setIsSubmitting(true);

    try {
      const res = await signIn(email, password);
      if (res?.error) {
        setFormError(res.error.message || 'Invalid email or password.');
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      setFormError(err?.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fde8f3_0%,#f3e8ff_50%,#faf4fb_100%)] px-4 py-8 text-[#2e1f3b] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[36px] border border-[#e9d5ff]/80 bg-white/85 shadow-2xl shadow-purple-950/10 backdrop-blur-xl lg:grid-cols-[1fr_1fr]">
          <div className="relative hidden flex-col justify-between bg-[linear-gradient(180deg,#fde8f3,#f3e8ff)] p-10 lg:flex">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-[#ec4899]">Lavs Studio Admin</p>
              <h1 className="mt-4 max-w-md text-4xl font-bold leading-tight text-[#2e1f3b]">Sign in to manage products, blog posts, categories, and settings.</h1>
            </div>
            <p className="max-w-md text-sm text-[#2e1f3b]/70">
              This console is separate from the public website and requires an authenticated Supabase admin account.
            </p>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#ec4899]">Admin Login</p>
              <h2 className="mt-3 text-3xl font-bold text-[#2e1f3b]">Welcome back</h2>
              <p className="mt-2 text-sm text-[#2e1f3b]/70">Use your email and password to enter the console.</p>
            </div>

            {!isSupabaseConfigured && (
              <div className="mb-6 rounded-2xl border border-purple-200 bg-purple-50/80 p-4 text-xs text-purple-900 shadow-sm">
                <p className="font-semibold text-purple-950 mb-1 flex items-center gap-1.5">
                  <span className="inline-block rounded-full bg-purple-200 p-1 text-[#ec4899]">⚡</span> Local Admin Mode Active (GitHub Pages)
                </p>
                <p className="leading-relaxed text-purple-900/80">
                  You are viewing the static GitHub Pages deployment. You can sign in with any email & password to manage products, categories, and home page content.
                </p>
              </div>
            )}

            {(formError || authError) && (
              <div className="mb-6 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {formError || authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#2e1f3b]/80">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-[#e9d5ff] bg-white px-4 py-3 text-[#2e1f3b] outline-none transition placeholder:text-[#2e1f3b]/40 focus:border-[#f472b6] shadow-sm"
                  placeholder="admin@lavsstudio.com"
                  autoComplete="email"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#2e1f3b]/80">Password</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-[#e9d5ff] bg-white px-4 py-3 text-[#2e1f3b] outline-none transition placeholder:text-[#2e1f3b]/40 focus:border-[#f472b6] shadow-sm"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full rounded-2xl bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-4 py-3.5 font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70 shadow-md shadow-[#f472b6]/25 font-bold"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-xs text-[#2e1f3b]/50">
              No public registration exists for this console. Only pre-authorized Supabase admin accounts can access it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

}