import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { fetchPublishedProducts, deleteProduct, saveProduct } from '../lib/content';

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
      if (supabase) {
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('id, name')
          .order('name');

        if (catError) console.error('Error loading categories:', catError);
        else setCategories(catData || []);
      }

      const allProducts = await fetchPublishedProducts();
      const mapped = allProducts.map((p) => ({
        ...p,
        name: p.name || p.title || '',
        price: typeof p.price === 'string' ? parseFloat(p.price.replace(/[^0-9.]/g, '')) || 0 : p.price || 0,
        image_url: p.image_url || p.image || '',
        categories: p.categories || { name: p.category || '' },
      }));
      setProducts(mapped);
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

  const handleTogglePublished = async (product) => {
    setTogglingId(product.id);
    const newStatus = !product.published;
    try {
      await saveProduct({ ...product, published: newStatus });

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, published: newStatus } : p))
      );
      showNotification(
        'success',
        `Product "${product.name || product.title}" status is now ${newStatus ? 'Published' : 'Draft'}.`
      );
    } catch (err) {
      console.error('Error toggling publish status:', err);
      showNotification('error', `Failed to update status: ${err.message}`);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteExecute = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);

      setProducts((prev) => prev.filter((p) => String(p.id) !== String(deleteTarget.id)));
      showNotification('success', `Product "${deleteTarget.name || deleteTarget.title}" deleted successfully.`);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      showNotification('error', `Failed to delete product: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      product.name?.toLowerCase().includes(search) ||
      product.brand?.toLowerCase().includes(search) ||
      product.short_description?.toLowerCase().includes(search) ||
      (product.tags && product.tags.some((t) => t.toLowerCase().includes(search)));

    const matchesCategory =
      selectedCategory === 'all' || product.category_id === selectedCategory || product.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'published' && product.published) ||
      (selectedStatus === 'draft' && !product.published);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    }
    if (sortBy === 'oldest') {
      return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    }
    if (sortBy === 'price-low') {
      return (a.price || 0) - (b.price || 0);
    }
    if (sortBy === 'price-high') {
      return (b.price || 0) - (a.price || 0);
    }
    if (sortBy === 'name-asc') {
      return (a.name || '').localeCompare(b.name || '');
    }
    return 0;
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

      {/* Header & Primary Action */}
      <div className="flex flex-col gap-4 border-b border-[#e9d5ff]/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#ec4899]">
            Management
          </p>
          <h2 className="mt-1 text-3xl font-bold text-[#2e1f3b]">Products Catalog</h2>
          <p className="mt-1 text-sm font-medium text-[#2e1f3b]/75">
            Create, edit, search, filter, and manage your products.
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-95 shadow-md"
        >
          <span>+</span> Add New Product
        </Link>
      </div>

      {/* Search & Filter Controls Toolbar */}
      <div className="grid gap-4 rounded-[24px] border border-[#e9d5ff] bg-white p-4 sm:grid-cols-2 lg:grid-cols-4 shadow-sm">
        {/* Search */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by name, brand, tag..."
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
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
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
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-3.5 py-2 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-3.5 py-2 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Count summary */}
      <div className="flex items-center justify-between text-xs text-[#2e1f3b]/70 font-semibold px-1">
        <p>
          Showing <span className="font-bold text-[#2e1f3b]">{sortedProducts.length}</span> of{' '}
          <span className="font-bold text-[#2e1f3b]">{products.length}</span> total products
        </p>
        {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedStatus('all');
            }}
            className="text-[#ec4899] font-bold hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Products Table Area */}
      {isLoading ? (
        <div className="rounded-[28px] border border-[#e9d5ff] bg-white p-12 text-center text-[#2e1f3b]/70 font-medium animate-pulse">
          Loading products catalog...
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="rounded-[28px] border border-[#e9d5ff] bg-white p-12 text-center shadow-sm">
          <p className="text-lg font-bold text-[#2e1f3b]">No products found</p>
          <p className="mt-1 text-sm text-[#2e1f3b]/70">
            {products.length === 0
              ? 'Get started by creating your first product!'
              : 'Try adjusting your search query or filter settings.'}
          </p>
          {products.length === 0 && (
            <Link
              to="/admin/products/new"
              className="mt-4 inline-block rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-5 py-2 text-sm font-bold text-white shadow"
            >
              + Add Product
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-[#e9d5ff] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#2e1f3b]">
              <thead className="border-b border-[#e9d5ff] bg-[#fde8f3]/60 text-xs font-bold uppercase tracking-wider text-[#2e1f3b]">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9d5ff]/60">
                {sortedProducts.map((product) => (
                  <tr key={product.id} className="transition hover:bg-[#faf4fb]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image_url || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=200&q=80'}
                          alt={product.name}
                          className="h-12 w-12 rounded-xl object-cover border border-[#e9d5ff] shrink-0 shadow-sm"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[#2e1f3b] truncate max-w-xs">{product.name}</p>
                          <p className="text-xs text-[#2e1f3b]/60 truncate max-w-xs">{product.brand || 'Lavs Studio'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-block rounded-full bg-[#fde8f3] border border-[#f472b6]/30 px-3 py-1 text-xs font-bold text-[#ec4899] capitalize">
                        {product.category || product.categories?.name || 'Uncategorized'}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-bold text-[#2e1f3b]">
                      ₹{typeof product.price === 'number' ? product.price.toLocaleString('en-IN') : String(product.price || '0').replace('$', '₹')}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        type="button"
                        disabled={togglingId === product.id}
                        onClick={() => handleTogglePublished(product)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
                          product.published
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${product.published ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {product.published ? 'Published' : 'Draft'}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="rounded-full border border-[#f472b6]/40 bg-[#fde8f3] px-3.5 py-1 text-xs font-bold text-[#2e1f3b] hover:bg-[#f472b6] hover:text-white transition"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(product)}
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[28px] border border-[#e9d5ff] bg-white p-6 shadow-2xl space-y-4 text-[#2e1f3b]">
            <h3 className="text-lg font-bold text-[#2e1f3b]">Confirm Deletion</h3>
            <p className="text-sm font-medium text-[#2e1f3b]/80">
              Are you sure you want to delete <strong className="text-[#2e1f3b] font-bold">"{deleteTarget.name}"</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e9d5ff]">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-full border border-[#e9d5ff] bg-white px-4 py-2 text-xs font-bold text-[#2e1f3b] hover:bg-[#fde8f3]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteExecute}
                className="rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-md disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
