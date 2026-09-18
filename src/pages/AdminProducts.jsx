import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Deletion Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status toggle state
  const [togglingId, setTogglingId] = useState(null);

  // Notification Banner
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchProductsAndCategories = async () => {
    setIsLoading(true);
    try {
      // Fetch categories for dropdown
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (catError) console.error('Error loading categories:', catError);
      else setCategories(catData || []);

      // Fetch products with joined category info
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*, categories(id, name)')
        .order('created_at', { ascending: false });

      if (prodError) throw prodError;
      setProducts(prodData || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      showNotification('error', 'Failed to load products from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  // Quick toggle published status
  const handleTogglePublished = async (product) => {
    setTogglingId(product.id);
    const newStatus = !product.published;
    try {
      const { error } = await supabase
        .from('products')
        .update({ published: newStatus })
        .eq('id', product.id);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, published: newStatus } : p))
      );
      showNotification(
        'success',
        `Product "${product.name}" is now ${newStatus ? 'Published' : 'Draft'}.`
      );
    } catch (err) {
      console.error('Error toggling publish status:', err);
      showNotification('error', `Failed to update status: ${err.message}`);
    } finally {
      setTogglingId(null);
    }
  };

  // Delete product confirmation & execution
  const handleDeleteExecute = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) throw error;

      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showNotification('success', `Product "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      showNotification('error', `Failed to delete product: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & Sort Logic
  const filteredProducts = products.filter((product) => {
    // Search query
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      product.name?.toLowerCase().includes(search) ||
      product.brand?.toLowerCase().includes(search) ||
      product.short_description?.toLowerCase().includes(search) ||
      (product.tags && product.tags.some((t) => t.toLowerCase().includes(search)));

    // Category filter
    const matchesCategory =
      selectedCategory === 'all' || product.category_id === selectedCategory;

    // Status filter
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'published' && product.published) ||
      (selectedStatus === 'draft' && !product.published);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    if (sortBy === 'oldest') {
      return new Date(a.created_at) - new Date(b.created_at);
    }
    if (sortBy === 'price-low') {
      return (a.price || 0) - (b.price || 0);
    }
    if (sortBy === 'price-high') {
      return (b.price || 0) - (a.price || 0);
    }
    if (sortBy === 'name-asc') {
      return a.name.localeCompare(b.name);
    }
    return 0;
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

      {/* Header & Primary Action */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#e2a4a4]">
            Management
          </p>
          <h2 className="mt-1 text-3xl font-semibold">Products Catalog</h2>
          <p className="mt-1 text-sm text-white/60">
            Create, edit, search, filter, and manage your products.
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e2a4a4] px-5 py-2.5 text-sm font-semibold text-[#130d11] transition hover:bg-[#efb3b3] shadow-lg shadow-[#e2a4a4]/20"
        >
          <span>+</span> Add New Product
        </Link>
      </div>

      {/* Search & Filter Controls Toolbar */}
      <div className="grid gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-white/60 mb-1.5">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by name, brand, tag..."
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
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
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
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-sm text-white focus:border-[#e2a4a4] focus:outline-none"
          >
            <option value="all" className="bg-[#130d11] text-white">All Statuses</option>
            <option value="published" className="bg-[#130d11] text-white">Published Only</option>
            <option value="draft" className="bg-[#130d11] text-white">Drafts Only</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-white/60 mb-1.5">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-sm text-white focus:border-[#e2a4a4] focus:outline-none"
          >
            <option value="newest" className="bg-[#130d11] text-white">Newest First</option>
            <option value="oldest" className="bg-[#130d11] text-white">Oldest First</option>
            <option value="price-low" className="bg-[#130d11] text-white">Price: Low to High</option>
            <option value="price-high" className="bg-[#130d11] text-white">Price: High to Low</option>
            <option value="name-asc" className="bg-[#130d11] text-white">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Count summary */}
      <div className="flex items-center justify-between text-xs text-white/60 px-1">
        <p>
          Showing <span className="font-semibold text-white">{sortedProducts.length}</span> of{' '}
          <span className="font-semibold text-white">{products.length}</span> total products
        </p>
        {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedStatus('all');
            }}
            className="text-[#e2a4a4] hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Products Content Area */}
      {isLoading ? (
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-12 text-center text-white/60 animate-pulse">
          Loading products catalog...
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-lg font-medium text-white/80">No products found</p>
          <p className="mt-1 text-sm text-white/50">
            {products.length === 0
              ? 'Get started by creating your first product!'
              : 'Try adjusting your search query or filter settings.'}
          </p>
          {products.length === 0 && (
            <Link
              to="/admin/products/new"
              className="mt-4 inline-block rounded-full bg-[#e2a4a4] px-5 py-2 text-sm font-semibold text-[#130d11]"
            >
              + Add Product
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/20 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/80">
              <thead className="border-b border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-wider text-white/60">
                <tr>
                  <th scope="col" className="py-4 px-4">Product</th>
                  <th scope="col" className="py-4 px-4">Category</th>
                  <th scope="col" className="py-4 px-4">Price</th>
                  <th scope="col" className="py-4 px-4 text-center">Featured</th>
                  <th scope="col" className="py-4 px-4 text-center">Status</th>
                  <th scope="col" className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sortedProducts.map((product) => (
                  <tr key={product.id} className="transition hover:bg-white/[0.03]">
                    {/* Product cell with image */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-white/30">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">{product.name}</p>
                          <p className="truncate text-xs text-white/50">
                            {product.brand ? `Brand: ${product.brand} • ` : ''}
                            {product.rating ? `★ ${product.rating}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-xs text-white/70">
                      {product.categories?.name ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                          {product.categories.name}
                        </span>
                      ) : (
                        <span className="text-white/40">Uncategorized</span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-white">
                        ${parseFloat(product.price || 0).toFixed(2)}
                      </div>
                      {product.original_price && (
                        <div className="text-xs text-white/40 line-through">
                          ${parseFloat(product.original_price).toFixed(2)}
                        </div>
                      )}
                    </td>

                    {/* Featured */}
                    <td className="py-3 px-4 text-center">
                      {product.featured ? (
                        <span className="inline-flex rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
                          ★ Featured
                        </span>
                      ) : (
                        <span className="text-xs text-white/30">—</span>
                      )}
                    </td>

                    {/* Status with interactive toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleTogglePublished(product)}
                        disabled={togglingId === product.id}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition cursor-pointer ${
                          product.published
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-white/10 text-white/60 border border-white/10 hover:bg-white/20'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            product.published ? 'bg-emerald-400' : 'bg-white/40'
                          }`}
                        />
                        {togglingId === product.id
                          ? 'Updating...'
                          : product.published
                          ? 'Published'
                          : 'Draft'}
                      </button>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:border-[#e2a4a4] hover:bg-[#e2a4a4]/10 hover:text-[#e2a4a4]"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(product)}
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

      {/* Confirmation Modal for Deleting Product */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[28px] border border-white/15 bg-[#181116] p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-white">Delete Product</h3>
            <p className="mt-2 text-sm text-white/70">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-white">"{deleteTarget.name}"</span>?
              This action cannot be undone and will permanently remove the product from your catalog.
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
                {isDeleting ? 'Deleting...' : 'Yes, Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
