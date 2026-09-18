import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../admin/AdminAuthProvider';
import { supabase } from '../lib/supabase';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { session, adminProfile, isLoading: isAuthLoading, isAuthorizedAdmin, signOut } = useAdminAuth();
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    publishedProducts: 0,
    draftProducts: 0,
    totalPosts: 0,
    publishedPosts: 0,
    totalCategories: 0,
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !isAuthorizedAdmin) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAuthorizedAdmin, isAuthLoading, navigate]);

  useEffect(() => {
    if (!isAuthorizedAdmin) return;

    async function fetchDashboardData() {
      setIsDataLoading(true);
      try {
        // Fetch counts
        const [
          { count: totalProducts },
          { count: publishedProducts },
          { count: totalPosts },
          { count: publishedPosts },
          { count: totalCategories }
        ] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('published', true),
          supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
          supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('published', true),
          supabase.from('categories').select('*', { count: 'exact', head: true })
        ]);

        setStats({
          totalProducts: totalProducts || 0,
          publishedProducts: publishedProducts || 0,
          draftProducts: (totalProducts || 0) - (publishedProducts || 0),
          totalPosts: totalPosts || 0,
          publishedPosts: publishedPosts || 0,
          totalCategories: totalCategories || 0,
        });

        // Fetch recent items
        const [productsRes, postsRes] = await Promise.all([
          supabase.from('products').select('id, name, created_at, published').order('created_at', { ascending: false }).limit(5),
          supabase.from('blog_posts').select('id, title, updated_at, published').order('updated_at', { ascending: false }).limit(5)
        ]);

        setRecentProducts(productsRes.data || []);
        setRecentPosts(postsRes.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsDataLoading(false);
      }
    }

    fetchDashboardData();
  }, [isAuthorizedAdmin]);

  if (isAuthLoading || !isAuthorizedAdmin) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-black/20 p-8 text-white/70">
        Loading admin dashboard...
      </div>
    );
  }

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts },
    { label: 'Published Products', value: stats.publishedProducts },
    { label: 'Draft Products', value: stats.draftProducts },
    { label: 'Total Blog Posts', value: stats.totalPosts },
    { label: 'Published Posts', value: stats.publishedPosts },
    { label: 'Total Categories', value: stats.totalCategories },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#e2a4a4]">Dashboard</p>
          <h2 className="mt-3 text-3xl font-semibold">Overview</h2>
          <p className="mt-2 text-sm text-white/65">
            Welcome back, {adminProfile?.full_name || session?.user?.email}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/products/new" className="rounded-full bg-[#e2a4a4] px-4 py-2 text-sm font-semibold text-[#130d11] transition hover:bg-[#efb3b3]">
            + Add Product
          </Link>
          <Link to="/admin/blog/new" className="rounded-full border border-[#e2a4a4]/30 px-4 py-2 text-sm text-white transition hover:border-[#e2a4a4]">
            + Add Post
          </Link>
          <Link to="/admin/categories/new" className="rounded-full border border-[#e2a4a4]/30 px-4 py-2 text-sm text-white transition hover:border-[#e2a4a4]">
            + Add Category
          </Link>
        </div>
      </div>

      {isDataLoading ? (
        <div className="mt-8 animate-pulse rounded-[28px] border border-white/10 bg-white/5 p-8 text-white/70">
          Loading statistics...
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {statCards.map((card) => (
              <div key={card.label} className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-center">
                <p className="text-3xl font-semibold text-white">{card.value}</p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#e2a4a4]/80">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="rounded-[28px] border border-white/10 bg-black/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Recently Added Products</h3>
                <Link to="/admin/products" className="text-sm text-[#e2a4a4] hover:underline">View all</Link>
              </div>
              {recentProducts.length === 0 ? (
                <p className="text-sm text-white/50">No products found.</p>
              ) : (
                <ul className="space-y-3">
                  {recentProducts.map(product => (
                    <li key={product.id} className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-sm">
                      <span className="truncate pr-4 text-white">{product.name}</span>
                      <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-wider ${product.published ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white/60'}`}>
                        {product.published ? 'Published' : 'Draft'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-[28px] border border-white/10 bg-black/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Recently Edited Posts</h3>
                <Link to="/admin/blog" className="text-sm text-[#e2a4a4] hover:underline">View all</Link>
              </div>
              {recentPosts.length === 0 ? (
                <p className="text-sm text-white/50">No posts found.</p>
              ) : (
                <ul className="space-y-3">
                  {recentPosts.map(post => (
                    <li key={post.id} className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-sm">
                      <span className="truncate pr-4 text-white">{post.title}</span>
                      <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-wider ${post.published ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white/60'}`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}