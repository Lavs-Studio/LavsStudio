import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../admin/AdminAuthProvider';
import {
  fetchPublishedProducts,
  fetchPublishedBlogPosts,
  fetchPublishedCategories,
} from '../lib/content';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { session, adminProfile, isLoading: isAuthLoading, isAuthorizedAdmin } = useAdminAuth();

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

    async function loadDashboardData() {
      setIsDataLoading(true);
      try {
        const [products, posts, categories] = await Promise.all([
          fetchPublishedProducts(),
          fetchPublishedBlogPosts(),
          fetchPublishedCategories(),
        ]);

        const totalProds = products.length;
        const pubProds = products.filter((p) => p.published !== false).length;
        const draftProds = totalProds - pubProds;

        const totalP = posts.length;
        const pubP = posts.filter((p) => p.published !== false).length;

        setStats({
          totalProducts: totalProds,
          publishedProducts: pubProds,
          draftProducts: draftProds,
          totalPosts: totalP,
          publishedPosts: pubP,
          totalCategories: categories.length,
        });

        setRecentProducts(products.slice(0, 6));
        setRecentPosts(posts.slice(0, 6));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsDataLoading(false);
      }
    }

    loadDashboardData();
  }, [isAuthorizedAdmin]);

  if (isAuthLoading || !isAuthorizedAdmin) {
    return (
      <div className="rounded-[28px] border border-[#e9d5ff] bg-white/80 p-8 text-[#2e1f3b]/70 font-medium">
        Loading admin dashboard...
      </div>
    );
  }

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, link: '/admin/products' },
    { label: 'Published Products', value: stats.publishedProducts, link: '/admin/products' },
    { label: 'Draft Products', value: stats.draftProducts, link: '/admin/products' },
    { label: 'Blog Posts', value: stats.totalPosts, link: '/admin/blog' },
    { label: 'Published Posts', value: stats.publishedPosts, link: '/admin/blog' },
    { label: 'Categories', value: stats.totalCategories, link: '/admin/categories' },
  ];

  return (
    <div className="space-y-8 text-[#2e1f3b]">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[#e9d5ff]/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#ec4899]">Dashboard</p>
          <h2 className="mt-2 text-3xl font-bold text-[#2e1f3b]">Overview</h2>
          <p className="mt-1 text-sm font-medium text-[#2e1f3b]/75">
            Welcome back, {adminProfile?.full_name || session?.user?.email || 'Admin'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/products/new"
            className="rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:opacity-95"
          >
            + Add Product
          </Link>
          <Link
            to="/admin/blog/new"
            className="rounded-full border border-[#f472b6]/40 bg-[#fde8f3] px-5 py-2.5 text-xs font-bold text-[#2e1f3b] transition hover:bg-[#f472b6] hover:text-white"
          >
            + Add Blog Post
          </Link>
          <Link
            to="/admin/categories"
            className="rounded-full border border-[#e9d5ff] bg-white px-5 py-2.5 text-xs font-bold text-[#2e1f3b] shadow-sm transition hover:bg-[#fde8f3]"
          >
            Manage Categories
          </Link>
        </div>
      </div>

      {isDataLoading ? (
        <div className="animate-pulse rounded-[28px] border border-[#e9d5ff] bg-white/70 p-8 text-[#2e1f3b]/70 font-medium">
          Loading dashboard statistics...
        </div>
      ) : (
        <>
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {statCards.map((card) => (
              <Link
                key={card.label}
                to={card.link}
                className="group rounded-[24px] border border-[#e9d5ff] bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-[#f472b6]/60 hover:shadow-md"
              >
                <p className="text-3xl font-bold text-[#2e1f3b] group-hover:text-[#ec4899] transition">{card.value}</p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#ec4899]">{card.label}</p>
              </Link>
            ))}
          </div>

          {/* Detailed Lists */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Products List */}
            <section className="rounded-[28px] border border-[#e9d5ff] bg-white p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#e9d5ff] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#2e1f3b]">Current Products</h3>
                  <p className="text-xs font-medium text-[#2e1f3b]/70">Manage items visible on storefront</p>
                </div>
                <Link to="/admin/products" className="text-xs font-bold text-[#ec4899] hover:underline">
                  View All Products ({stats.totalProducts}) →
                </Link>
              </div>

              {recentProducts.length === 0 ? (
                <p className="py-6 text-center text-sm font-medium text-[#2e1f3b]/60">No products found.</p>
              ) : (
                <div className="space-y-3">
                  {recentProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-[#e9d5ff]/60 bg-[#faf4fb] p-3.5 transition hover:bg-[#fde8f3]/40"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={product.image || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=200&q=80'}
                          alt={product.title || product.name}
                          className="h-12 w-12 rounded-xl object-cover border border-[#e9d5ff] shrink-0 shadow-sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#2e1f3b]">{product.title || product.name}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs font-medium text-[#2e1f3b]/70">
                            <span className="capitalize">{product.category || 'Product'}</span>
                            {product.price && <span>• {product.price}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            product.published !== false
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {product.published !== false ? 'Published' : 'Draft'}
                        </span>
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="rounded-full border border-[#f472b6]/40 bg-[#fde8f3] px-3.5 py-1 text-xs font-bold text-[#2e1f3b] hover:bg-[#f472b6] hover:text-white transition"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Blog Posts List */}
            <section className="rounded-[28px] border border-[#e9d5ff] bg-white p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#e9d5ff] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#2e1f3b]">Current Blog Posts</h3>
                  <p className="text-xs font-medium text-[#2e1f3b]/70">Manage articles and beauty notes</p>
                </div>
                <Link to="/admin/blog" className="text-xs font-bold text-[#ec4899] hover:underline">
                  View All Posts ({stats.totalPosts}) →
                </Link>
              </div>

              {recentPosts.length === 0 ? (
                <p className="py-6 text-center text-sm font-medium text-[#2e1f3b]/60">No blog posts found.</p>
              ) : (
                <div className="space-y-3">
                  {recentPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-[#e9d5ff]/60 bg-[#faf4fb] p-3.5 transition hover:bg-[#fde8f3]/40"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {post.image && (
                          <img
                            src={post.image}
                            alt={post.title}
                            className="h-12 w-12 rounded-xl object-cover border border-[#e9d5ff] shrink-0 shadow-sm"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#2e1f3b]">{post.title}</p>
                          <p className="mt-0.5 text-xs font-medium text-[#2e1f3b]/70 truncate">
                            {post.category} {post.date ? `• ${post.date}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            post.published !== false
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {post.published !== false ? 'Published' : 'Draft'}
                        </span>
                        <Link
                          to={`/admin/blog/${post.id}/edit`}
                          className="rounded-full border border-[#f472b6]/40 bg-[#fde8f3] px-3.5 py-1 text-xs font-bold text-[#2e1f3b] hover:bg-[#f472b6] hover:text-white transition"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}