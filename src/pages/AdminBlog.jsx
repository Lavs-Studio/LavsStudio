import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

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
      // Fetch categories for filter dropdown
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (catError) console.error('Error fetching categories:', catError);
      else setCategories(catData || []);

      // Fetch blog posts with joined category name
      const { data: postData, error: postError } = await supabase
        .from('blog_posts')
        .select('*, categories(id, name)')
        .order('created_at', { ascending: false });

      if (postError) throw postError;
      setPosts(postData || []);
    } catch (err) {
      console.error('Error loading blog posts:', err);
      showNotification('error', `Failed to load blog posts: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPostsAndCategories();
  }, []);

  // Quick toggle published status
  const handleTogglePublished = async (post) => {
    setTogglingId(post.id);
    const newStatus = !post.published;
    const nowISO = newStatus ? new Date().toISOString() : post.published_at;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          published: newStatus,
          published_at: nowISO,
        })
        .eq('id', post.id);

      if (error) throw error;

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

  // Execute deletion
  const handleDeleteExecute = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) throw error;

      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showNotification('success', `Post "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting blog post:', err);
      showNotification('error', `Failed to delete post: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Posts
  const filteredPosts = posts.filter((post) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      post.title?.toLowerCase().includes(search) ||
      post.author?.toLowerCase().includes(search) ||
      post.excerpt?.toLowerCase().includes(search) ||
      (post.tags && post.tags.some((t) => t.toLowerCase().includes(search)));

    const matchesCategory =
      categoryFilter === 'all' || post.category_id === categoryFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && post.published) ||
      (statusFilter === 'draft' && !post.published);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 rounded-2xl px-5 py-4 shadow-2xl backdrop-blur-xl border transition-all animate-bounce ${
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
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#e2a4a4]">
            Content Management
          </p>
          <h2 className="mt-1 text-3xl font-semibold">Blog Posts</h2>
          <p className="mt-1 text-sm text-white/60">
            Write, edit, preview, publish, and delete blog posts for your website.
          </p>
        </div>
        <Link
          to="/admin/blog/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e2a4a4] px-5 py-2.5 text-sm font-semibold text-[#130d11] transition hover:bg-[#efb3b3] shadow-lg shadow-[#e2a4a4]/20"
        >
          <span>+</span> Create New Post
        </Link>
      </div>

      {/* Toolbar / Search & Filters */}
      <div className="grid gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4 sm:grid-cols-3">
        {/* Search */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-white/60 mb-1.5">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by title, author, tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-sm text-white placeholder-white/40 focus:border-[#e2a4a4] focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-white/60 mb-1.5">
            Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-sm text-white focus:border-[#e2a4a4] focus:outline-none"
          >
            <option value="all" className="bg-[#130d11] text-white">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-[#130d11] text-white">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-white/60 mb-1.5">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-sm text-white focus:border-[#e2a4a4] focus:outline-none"
          >
            <option value="all" className="bg-[#130d11] text-white">All Statuses</option>
            <option value="published" className="bg-[#130d11] text-white">Published Only</option>
            <option value="draft" className="bg-[#130d11] text-white">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* Count summary */}
      <div className="flex items-center justify-between text-xs text-white/60 px-1">
        <p>
          Showing <span className="font-semibold text-white">{filteredPosts.length}</span> of{' '}
          <span className="font-semibold text-white">{posts.length}</span> total posts
        </p>
        {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setStatusFilter('all');
            }}
            className="text-[#e2a4a4] hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-12 text-center text-white/60 animate-pulse">
          Loading blog posts...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-lg font-medium text-white/80">No blog posts found</p>
          <p className="mt-1 text-sm text-white/50">
            {posts.length === 0
              ? 'Get started by creating your first article!'
              : 'Try changing your search keywords or status filter.'}
          </p>
          {posts.length === 0 && (
            <Link
              to="/admin/blog/new"
              className="mt-4 inline-block rounded-full bg-[#e2a4a4] px-5 py-2 text-sm font-semibold text-[#130d11]"
            >
              + Create Post
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/20 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/80">
              <thead className="border-b border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-wider text-white/60">
                <tr>
                  <th scope="col" className="py-4 px-4">Article</th>
                  <th scope="col" className="py-4 px-4">Category</th>
                  <th scope="col" className="py-4 px-4">Author</th>
                  <th scope="col" className="py-4 px-4">Published Date</th>
                  <th scope="col" className="py-4 px-4 text-center">Status</th>
                  <th scope="col" className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="transition hover:bg-white/[0.03]">
                    {/* Title & Cover */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                          {post.cover_image ? (
                            <img
                              src={post.cover_image}
                              alt={post.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/150?text=No+Cover';
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-white/30">
                              No cover
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="truncate font-semibold text-white">{post.title}</p>
                          <p className="truncate text-xs text-white/50">{post.excerpt}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-xs text-white/70 whitespace-nowrap">
                      {post.categories?.name ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                          {post.categories.name}
                        </span>
                      ) : (
                        <span className="text-white/40">Uncategorized</span>
                      )}
                    </td>

                    {/* Author */}
                    <td className="py-3 px-4 text-xs text-white/70 whitespace-nowrap">
                      {post.author || 'Lavs Studio'}
                    </td>

                    {/* Published Date */}
                    <td className="py-3 px-4 text-xs text-white/60 whitespace-nowrap">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Not published'}
                    </td>

                    {/* Status Pill Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleTogglePublished(post)}
                        disabled={togglingId === post.id}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition cursor-pointer ${
                          post.published
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-white/10 text-white/60 border border-white/10 hover:bg-white/20'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            post.published ? 'bg-emerald-400' : 'bg-white/40'
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
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:border-[#e2a4a4] hover:bg-[#e2a4a4]/10 hover:text-[#e2a4a4]"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(post)}
                          className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[28px] border border-white/15 bg-[#181116] p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-white">Delete Article</h3>
            <p className="mt-2 text-sm text-white/70">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-white">"{deleteTarget.title}"</span>?
              This action cannot be undone and will permanently remove the post from your website.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteExecute}
                disabled={isDeleting}
                className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 shadow-lg shadow-rose-600/30 disabled:opacity-50"
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
