import { NavLink, Outlet } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthProvider';

const adminLinks = [
  { name: 'Dashboard', to: '/admin/dashboard' },
  { name: 'Products', to: '/admin/products' },
  { name: 'Categories', to: '/admin/categories' },
  { name: 'Blog Posts', to: '/admin/blog' },
  { name: 'Homepage', to: '/admin/homepage' },
  { name: 'Media', to: '/admin/media' },
  { name: 'Site Settings', to: '/admin/settings' },
  { name: 'Admin Profile', to: '/admin/profile' },
];


export default function AdminLayout() {
  const { session, signOut } = useAdminAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fde8f3_0%,#f3e8ff_50%,#faf4fb_100%)] text-[#2e1f3b]">
      <header className="border-b border-[#e9d5ff]/60 bg-white/70 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#ec4899]">Lavs Studio Admin</p>
            <h1 className="mt-1 text-xl font-bold text-[#2e1f3b]">Content Console</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-[#e9d5ff] bg-white/80 px-3 py-2 text-sm text-[#2e1f3b]/75 md:inline-flex">
              {session?.user?.email ?? 'Signed in'}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="rounded-full border border-[#f472b6]/40 bg-white/80 px-4 py-2 text-sm font-medium text-[#2e1f3b] transition hover:border-[#f472b6] hover:bg-[#fde8f3]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="rounded-[28px] border border-[#e9d5ff]/80 bg-white/80 p-4 shadow-xl shadow-purple-950/5 backdrop-blur-xl">
          <nav className="space-y-2">
            {adminLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm transition ${
                    isActive
                      ? 'bg-gradient-to-r from-[#f472b6] to-[#c084fc] font-semibold text-white shadow-md shadow-[#f472b6]/20'
                      : 'text-[#2e1f3b]/75 hover:bg-[#f3e8ff]/60 hover:text-[#2e1f3b]'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 rounded-2xl border border-[#e9d5ff] bg-[#fde8f3]/40 p-4 text-sm text-[#2e1f3b]/80">
            <p className="font-semibold text-[#2e1f3b]">Protected Access</p>
            <p className="mt-2 text-xs text-[#2e1f3b]/70">Only authenticated admin accounts listed in Supabase can use this console.</p>
          </div>
        </aside>

        <main className="rounded-[32px] border border-[#e9d5ff]/80 bg-white/80 p-4 shadow-xl shadow-purple-950/5 backdrop-blur-xl sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
