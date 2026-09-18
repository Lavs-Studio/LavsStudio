import { useState, useEffect } from 'react';
import { saveProduct } from '../lib/content';

export default function ProductEditModal({ isOpen, onClose, product, onSave }) {
  const isEdit = Boolean(product && product.id);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: 'Fashion',
    price: '',
    original_price: '',
    description: '',
    image: '',
    amazon_url: '',
    brand: '',
    rating: '4.8',
    featured: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id || '',
        name: product.title || product.name || '',
        category: product.category || 'Fashion',
        price: product.price ? String(product.price).replace('$', '') : '',
        original_price: product.original_price ? String(product.original_price).replace('$', '') : '',
        description: product.description || '',
        image: product.image || product.image_url || '',
        amazon_url: product.amazon_url || product.affiliate_url || product.amazonLink || '',
        brand: product.brand || 'Lavs Studio Select',
        rating: product.rating ? String(product.rating) : '4.8',
        featured: product.featured !== false,
      });
    } else {
      setFormData({
        id: '',
        name: '',
        category: 'Fashion',
        price: '',
        original_price: '',
        description: '',
        image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
        amazon_url: '',
        brand: 'Lavs Studio Select',
        rating: '4.8',
        featured: true,
      });
    }
    setSuccessMessage('');
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);

    const priceVal = parseFloat(formData.price) || 0;
    const origPriceVal = formData.original_price ? parseFloat(formData.original_price) : null;
    let discountVal = null;
    if (origPriceVal && origPriceVal > priceVal) {
      discountVal = Math.round(((origPriceVal - priceVal) / origPriceVal) * 100);
    }

    const payload = {
      id: formData.id || `custom-${Date.now()}`,
      name: formData.name.trim(),
      title: formData.name.trim(),
      slug: formData.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
      category: formData.category,
      price: priceVal,
      original_price: origPriceVal,
      discount: discountVal,
      description: formData.description.trim(),
      short_description: formData.description.trim(),
      image_url: formData.image.trim(),
      image: formData.image.trim(),
      amazon_url: formData.amazon_url.trim(),
      affiliate_url: formData.amazon_url.trim(),
      brand: formData.brand.trim(),
      rating: parseFloat(formData.rating) || 4.8,
      featured: Boolean(formData.featured),
      published: true,
    };

    await saveProduct(payload);
    setIsSubmitting(false);
    setSuccessMessage(isEdit ? 'Product updated successfully!' : 'Product added successfully!');

    setTimeout(() => {
      if (onSave) onSave(payload);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-2xl rounded-[32px] border border-[#e9d5ff]/80 bg-white/95 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#e9d5ff]/60 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ec4899]">
              Storefront Product Editor
            </p>
            <h2 className="text-2xl font-bold text-[#2e1f3b] mt-1">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-full bg-[#f3e8ff]/80 p-2 text-[#2e1f3b]/60 transition hover:bg-[#fde8f3] hover:text-[#2e1f3b]"
          >
            ✕
          </button>
        </div>

        {successMessage && (
          <div className="mt-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-center text-sm font-semibold text-emerald-700">
            ✓ {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Title / Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#2e1f3b]/70 mb-1.5">
              Product Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Silk Satin Wrap Dress"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-2xl border border-[#e9d5ff] bg-white px-4 py-3 text-sm text-[#2e1f3b] placeholder-[#2e1f3b]/40 outline-none focus:border-[#ec4899] focus:ring-2 focus:ring-[#ec4899]/20"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#2e1f3b]/70 mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-2xl border border-[#e9d5ff] bg-white px-4 py-3 text-sm text-[#2e1f3b] outline-none focus:border-[#ec4899]"
              >
                <option value="Fashion">Fashion</option>
                <option value="Jewellery">Jewellery</option>
                <option value="Hair Care">Hair Care</option>
                <option value="Skin Care">Skin Care</option>
                <option value="Amazon Finds">Amazon Finds</option>
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#2e1f3b]/70 mb-1.5">
                Brand
              </label>
              <input
                type="text"
                placeholder="Brand name"
                value={formData.brand}
                onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                className="w-full rounded-2xl border border-[#e9d5ff] bg-white px-4 py-3 text-sm text-[#2e1f3b] outline-none focus:border-[#ec4899]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Current Price */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#2e1f3b]/70 mb-1.5">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="49.99"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                className="w-full rounded-2xl border border-[#e9d5ff] bg-white px-4 py-3 text-sm text-[#2e1f3b] outline-none focus:border-[#ec4899]"
              />
            </div>

            {/* Original Price */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#2e1f3b]/70 mb-1.5">
                Original Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="79.99"
                value={formData.original_price}
                onChange={(e) => setFormData((prev) => ({ ...prev, original_price: e.target.value }))}
                className="w-full rounded-2xl border border-[#e9d5ff] bg-white px-4 py-3 text-sm text-[#2e1f3b] outline-none focus:border-[#ec4899]"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#2e1f3b]/70 mb-1.5">
                Rating (0.0 - 5.0)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData((prev) => ({ ...prev, rating: e.target.value }))}
                className="w-full rounded-2xl border border-[#e9d5ff] bg-white px-4 py-3 text-sm text-[#2e1f3b] outline-none focus:border-[#ec4899]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#2e1f3b]/70 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Product recommendation details, style notes, or why you love it..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-2xl border border-[#e9d5ff] bg-white px-4 py-3 text-sm text-[#2e1f3b] placeholder-[#2e1f3b]/40 outline-none focus:border-[#ec4899]"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#2e1f3b]/70 mb-1.5">
              Product Image URL
            </label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={formData.image}
              onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
              className="w-full rounded-2xl border border-[#e9d5ff] bg-white px-4 py-3 text-sm text-[#2e1f3b] outline-none focus:border-[#ec4899]"
            />
          </div>

          {/* Amazon Affiliate Link */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#2e1f3b]/70 mb-1.5">
              Amazon Affiliate Link
            </label>
            <input
              type="url"
              placeholder="https://www.amazon.com/dp/... or https://amzn.to/..."
              value={formData.amazon_url}
              onChange={(e) => setFormData((prev) => ({ ...prev, amazon_url: e.target.value }))}
              className="w-full rounded-2xl border border-[#e9d5ff] bg-white px-4 py-3 text-sm text-[#2e1f3b] outline-none focus:border-[#ec4899]"
            />
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="featured-check"
              checked={formData.featured}
              onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
              className="h-4 w-4 rounded border-[#e9d5ff] text-[#ec4899] focus:ring-[#ec4899]"
            />
            <label htmlFor="featured-check" className="text-sm font-semibold text-[#2e1f3b] cursor-pointer">
              Show in Featured Products Section on Home Page
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e9d5ff]/60">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#e9d5ff] bg-white px-6 py-2.5 text-sm font-semibold text-[#2e1f3b] hover:bg-[#fde8f3]/60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-8 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#f472b6]/25 transition hover:opacity-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
