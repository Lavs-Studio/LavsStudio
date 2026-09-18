import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { blogPosts as fallbackBlogPosts } from '../blog/posts';

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Deletion Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status Toggle
  const [togglingId, setTogglingId] = useState(null);

  // Notification Toast
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchPostsAndCategories = async () => {
    setIsLoading(true);
    try {
      if (!supabase || !isSupabaseConfigured) {
        setPosts(fallbackBlogPosts.map((p) => ({ ...p, published: true, created_at: p.date })));
        return;
      }

      const { data: catData } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      setCategories(catData || []);

      const { data: postData, error: postError } = await supabase
        .from('blog_posts')
        .select('*, categories(id, name)')
        .order('created_at', { ascending: false });

      if (postError || !postData || postData.length === 0) {
        setPosts(fallbackBlogPosts.map((p) => ({ ...p, published: true, created_at: p.date })));
      } else {
        setPosts(postData);
      }
    } catch (err) {
      console.error('Error loading blog posts:', err);
      setPosts(fallbackBlogPosts.map((p) => ({ ...p, published: true, created_at: p.date })));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPostsAndCategories();
  }, []);

  const handleTogglePublished = async (post) => {
    setTogglingId(post.id);
    const newStatus = !post.published;
    const nowISO = newStatus ? new Date().toISOString() : post.published_at;

    try {
      if (supabase && isSupabaseConfigured) {
        await supabase
          .from('blog_posts')
          .update({
            published: newStatus,
            published_at: nowISO,
          })
          .eq('id', post.id);
      }

      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, published: newStatus, published_at: nowISO }
            : p
        )
      );

      showNotification(
        'success',
        `Post "${post.title}" is now ${newStatus ? 'Published' : 'Draft'}.`
      );
    } catch (err) {
      console.error('Error updating status:', err);
      showNotification('error', `Failed to update status: ${err.message}`);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteExecute = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (supabase && isSupabaseConfigured) {
        await supabase
          .from('blog_posts')
          .delete()
          .eq('id', deleteTarget.id);
      }

      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showNotification('success', `Post "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting post:', err);
      showNotification('error', `Failed to delete post: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      post.title?.toLowerCase().includes(search) ||
      post.author?.toLowerCase().includes(search) ||
      (post.tags && post.tags.some((t) => t.toLowerCase().includes(search)));

    const matchesCategory =
      categoryFilter === 'all' || post.category_id === categoryFilter || post.category === categoryFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && post.published) ||
      (statusFilter === 'draft' && !post.published);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 text-[#2e1f3b]">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 rounded-2xl px-5 py-4 shadow-2xl backdrop-blur-xl border transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/30 text-rose-200'
          }`}
        >
          <span className="text-xl">
            {notification.type === 'success' ? '✓' : '⚠️'}
          </span>
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}

      {/* Header & New Action */}
      <div className="flex flex-col gap-4 border-b border-[#e9d5ff]/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#ec4899]">
            Content Management
          </p>
          <h2 className="mt-1 text-3xl font-bold text-[#2e1f3b]">Blog Posts</h2>
          <p className="mt-1 text-sm font-medium text-[#2e1f3b]/75">
            Write, edit, preview, publish, and delete blog posts for your website.
          </p>
        </div>
        <Link
          to="/admin/blog/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-95 shadow-md"
        >
          <span>+</span> Create New Post
        </Link>
      </div>

      {/* Toolbar / Search & Filters */}
      <div className="grid gap-4 rounded-[24px] border border-[#e9d5ff] bg-white p-4 sm:grid-cols-3 shadow-sm">
        {/* Search */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by title, author, tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-3.5 py-2 text-sm font-semibold text-[#2e1f3b] placeholder-[#2e1f3b]/40 focus:border-[#f472b6] focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
            Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-3.5 py-2 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-3.5 py-2 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* Count summary */}
      <div className="flex items-center justify-between text-xs font-semibold text-[#2e1f3b]/70 px-1">
        <p>
          Showing <span className="font-bold text-[#2e1f3b]">{filteredPosts.length}</span> of{' '}
          <span className="font-bold text-[#2e1f3b]">{posts.length}</span> total posts
        </p>
        {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setStatusFilter('all');
            }}
            className="text-[#ec4899] font-bold hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="rounded-[28px] border border-[#e9d5ff] bg-white p-12 text-center text-[#2e1f3b]/70 font-medium animate-pulse">
          Loading blog posts...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="rounded-[28px] border border-[#e9d5ff] bg-white p-12 text-center shadow-sm">
          <p className="text-lg font-bold text-[#2e1f3b]">No blog posts found</p>
          <p className="mt-1 text-sm text-[#2e1f3b]/70 font-medium">
            {posts.length === 0
              ? 'Get started by creating your first article!'
              : 'Try changing your search keywords or status filter.'}
          </p>
          {posts.length === 0 && (
            <Link
              to="/admin/blog/new"
              className="mt-4 inline-block rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-5 py-2 text-sm font-bold text-white shadow"
            >
              + Create Post
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-[#e9d5ff] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#2e1f3b]">
              <thead className="border-b border-[#e9d5ff] bg-[#fde8f3]/60 text-xs font-bold uppercase tracking-wider text-[#2e1f3b]">
                <tr>
                  <th scope="col" className="py-4 px-4">Article</th>
                  <th scope="col" className="py-4 px-4">Category</th>
                  <th scope="col" className="py-4 px-4">Author</th>
                  <th scope="col" className="py-4 px-4">Published Date</th>
                  <th scope="col" className="py-4 px-4 text-center">Status</th>
                  <th scope="col" className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9d5ff]/60">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="transition hover:bg-[#faf4fb]">
                    {/* Title & Cover */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-[#e9d5ff] bg-[#faf4fb] shadow-sm">
                          {post.cover_image || post.image ? (
                            <img
                              src={post.cover_image || post.image}
                              alt={post.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/150?text=No+Cover';
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-[#2e1f3b]/40">
                              No cover
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="truncate font-bold text-[#2e1f3b]">{post.title}</p>
                          <p className="truncate text-xs font-medium text-[#2e1f3b]/60">{post.excerpt}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-xs font-bold text-[#ec4899] whitespace-nowrap">
                      <span className="rounded-full border border-[#f472b6]/30 bg-[#fde8f3] px-2.5 py-1">
                        {post.category || post.categories?.name || 'Fashion'}
                      </span>
                    </td>

                    {/* Author */}
                    <td className="py-3 px-4 text-xs font-bold text-[#2e1f3b] whitespace-nowrap">
                      {post.author || 'Lavs Studio'}
                    </td>

                    {/* Published Date */}
                    <td className="py-3 px-4 text-xs font-medium text-[#2e1f3b]/70 whitespace-nowrap">
                      {post.published_at || post.date
                        ? post.date || new Date(post.published_at).toLocaleDateString()
                        : 'Not published'}
                    </td>

                    {/* Status Pill Toggle */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePublished(post)}
                        disabled={togglingId === post.id}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition cursor-pointer ${
                          post.published
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            post.published ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        {togglingId === post.id
                          ? 'Updating...'
                          : post.published
                          ? 'Published'
                          : 'Draft'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/blog/${post.id}/edit`}
                          className="rounded-full border border-[#f472b6]/40 bg-[#fde8f3] px-3.5 py-1 text-xs font-bold text-[#2e1f3b] hover:bg-[#f472b6] hover:text-white transition"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(post)}
                          className="rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-600 hover:text-white transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[28px] border border-[#e9d5ff] bg-white p-6 shadow-2xl text-[#2e1f3b]">
            <h3 className="text-xl font-bold text-[#2e1f3b]">Delete Article</h3>
            <p className="mt-2 text-sm font-medium text-[#2e1f3b]/80">
              Are you sure you want to delete{' '}
              <strong className="font-bold text-[#2e1f3b]">"{deleteTarget.title}"</strong>?
              This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#e9d5ff]">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="rounded-full border border-[#e9d5ff] bg-white px-5 py-2 text-xs font-bold text-[#2e1f3b] hover:bg-[#fde8f3]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteExecute}
                disabled={isDeleting}
                className="rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
