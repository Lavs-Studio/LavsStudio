import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import MediaPickerModal from '../components/MediaPickerModal';
import { fetchPublishedProducts, fetchPublishedCategories, saveProduct } from '../lib/content';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEdit);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    short_description: '',
    description: '',
    category_id: '',
    brand: '',
    price: '',
    original_price: '',
    discount: '',
    image_url: '',
    amazon_url: '',
    affiliate_url: '',
    rating: '',
    tagsInput: '',
    featured: false,
    published: true,
  });

  // Image & Drag & Drop State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Validation Errors & Saving state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Auto-slug tracking
  const [autoSlug, setAutoSlug] = useState(!isEdit);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  useEffect(() => {
    async function loadInitialData() {
      try {
        const cats = await fetchPublishedCategories();
        setCategories(cats);

        if (isEdit) {
          const allProducts = await fetchPublishedProducts();
          const prodData = allProducts.find(
            (p) => String(p.id) === String(id) || String(p.slug) === String(id)
          );

          if (prodData) {
            const initialCategory = prodData.category_id || prodData.category_slug || prodData.category || '';
            setFormData({
              name: prodData.title || prodData.name || '',
              slug: prodData.slug || '',
              short_description: prodData.short_description || prodData.description || '',
              description: prodData.full_description || prodData.description || '',
              category_id: initialCategory,
              brand: prodData.brand || '',
              price: prodData.price !== null ? String(prodData.price).replace(/[^0-9.]/g, '') : '',
              original_price:
                prodData.original_price !== null ? String(prodData.original_price).replace(/[^0-9.]/g, '') : '',
              discount: prodData.discount !== null ? String(prodData.discount) : '',
              image_url: prodData.image_url || prodData.image || '',
              amazon_url: prodData.amazon_url || prodData.affiliate_url || '',
              affiliate_url: prodData.affiliate_url || prodData.amazon_url || '',
              rating: prodData.rating !== null ? String(prodData.rating) : '',
              tagsInput: (prodData.tags || []).join(', '),
              featured: Boolean(prodData.featured),
              published: prodData.published !== false,
            });
            const img = prodData.image_url || prodData.image;
            if (img) {
              setImagePreview(img);
            }
          }
        }
      } catch (err) {
        console.error('Error loading product details:', err);
        showNotification('error', `Failed to load product: ${err.message}`);
      } finally {
        setIsLoadingProduct(false);
      }
    }

    loadInitialData();
  }, [id, isEdit]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: autoSlug ? generateSlug(val) : prev.slug,
    }));
    if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotification('error', 'Please drop a valid image file (JPG, PNG, WebP).');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      if (errors.image) setErrors((prev) => ({ ...prev, image: null }));
    }
  };

  const handleImageFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotification('error', 'Please select a valid image file.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      if (errors.image) setErrors((prev) => ({ ...prev, image: null }));
    }
  };

  const uploadImageToStorage = async (file) => {
    setIsUploadingImage(true);
    try {
      if (!supabase) return URL.createObjectURL(file);
      const fileExt = file.name.split('.').pop();
      const fileName = `products/${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('website-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.warn('Storage upload error, using local object url:', error);
        return URL.createObjectURL(file);
      }

      const { data: publicUrlData } = supabase.storage
        .from('website-images')
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (err) {
      return URL.createObjectURL(file);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }
    if (!formData.amazon_url.trim() && !formData.affiliate_url.trim()) {
      newErrors.amazon_url = 'Amazon product link is required';
    }
    if (!imagePreview && !formData.image_url.trim() && !imageFile) {
      newErrors.image = 'Product Image is required (upload, drop image file, or enter URL)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showNotification('error', 'Please fill out all required product fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.image_url.trim() || imagePreview;

      if (imageFile) {
        finalImageUrl = await uploadImageToStorage(imageFile);
      }

      const slug = formData.slug.trim() || generateSlug(formData.name);
      const amazonLink = formData.amazon_url.trim() || formData.affiliate_url.trim();

      const payload = {
        id: isEdit ? id : `custom-${Date.now()}`,
        name: formData.name.trim(),
        title: formData.name.trim(),
        slug: slug,
        short_description: formData.short_description.trim() || formData.description.trim().slice(0, 120),
        description: formData.description.trim(),
        category: formData.category_id,
        category_id: formData.category_id,
        brand: formData.brand.trim() || 'Lavs Studio',
        price: formData.price ? parseFloat(formData.price) : 999,
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        discount: formData.discount ? parseFloat(formData.discount) : null,
        image_url: finalImageUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
        image: finalImageUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
        amazon_url: amazonLink,
        affiliate_url: amazonLink,
        rating: formData.rating ? parseFloat(formData.rating) : 4.8,
        tags: formData.tagsInput
          ? formData.tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
          : ['Amazon Finds'],
        featured: Boolean(formData.featured),
        published: Boolean(formData.published),
      };

      await saveProduct(payload);
      showNotification('success', isEdit ? 'Product updated successfully!' : 'Product created successfully!');

      setTimeout(() => {
        navigate('/admin/products');
      }, 1000);
    } catch (err) {
      console.error('Error saving product:', err);
      showNotification('error', `Failed to save product: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="rounded-[28px] border border-[#e9d5ff] bg-white p-12 text-center text-[#2e1f3b]/70 font-medium animate-pulse">
        Loading product details...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-[#2e1f3b]">
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

      {/* Header & Back Link */}
      <div className="flex flex-col gap-2 border-b border-[#e9d5ff]/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/admin/products"
            className="text-xs font-bold uppercase tracking-wider text-[#ec4899] hover:underline"
          >
            ← Back to Products List
          </Link>
          <h2 className="mt-2 text-3xl font-bold text-[#2e1f3b]">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Required Section */}
        <div className="rounded-[28px] border border-[#e9d5ff] bg-white p-6 sm:p-8 space-y-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#ec4899]">Product Details</h3>

          {/* 1. Image Drag & Drop / Upload / URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-2">
              1. Product Image (Drag & Drop or Upload) <span className="text-rose-500">*</span>
            </label>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                isDragging
                  ? 'border-[#f472b6] bg-[#fde8f3]/60'
                  : errors.image
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-[#e9d5ff] bg-[#faf4fb] hover:border-[#f472b6]'
              }`}
            >
              {imagePreview ? (
                <div className="relative group w-full max-w-sm flex flex-col items-center">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="h-56 w-full rounded-xl object-cover shadow border border-[#e9d5ff]"
                  />
                  <div className="mt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        setFormData((prev) => ({ ...prev, image_url: '' }));
                      }}
                      className="rounded-full bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 shadow"
                    >
                      Remove Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="rounded-full border border-[#e9d5ff] bg-white px-4 py-1.5 text-xs font-bold text-[#2e1f3b] hover:bg-[#fde8f3]"
                    >
                      Choose from Library
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 py-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fde8f3] text-[#ec4899]">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#2e1f3b]">
                      Drag & drop your product image here
                    </p>
                    <p className="mt-1 text-xs text-[#2e1f3b]/70 font-medium">
                      or{' '}
                      <label className="cursor-pointer text-[#ec4899] font-bold hover:underline">
                        browse from computer
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileSelect}
                          className="hidden"
                        />
                      </label>
                      {' '}or{' '}
                      <button
                        type="button"
                        onClick={() => setIsMediaPickerOpen(true)}
                        className="text-[#ec4899] font-bold hover:underline"
                      >
                        select media library
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Image URL input option */}
            <div className="mt-3">
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, image_url: e.target.value }));
                  if (e.target.value) setImagePreview(e.target.value);
                  if (errors.image) setErrors((prev) => ({ ...prev, image: null }));
                }}
                placeholder="Or paste image URL (e.g. https://images.unsplash.com/...)"
                className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2 text-xs font-semibold text-[#2e1f3b] placeholder-[#2e1f3b]/40 focus:border-[#f472b6] focus:outline-none"
              />
            </div>
            {errors.image && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.image}</p>}
          </div>

          {/* 2. Product Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
              2. Product Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g. Floral Chiffon Midi Dress"
              className={`w-full rounded-xl border bg-[#faf4fb] px-4 py-3 text-sm font-semibold text-[#2e1f3b] placeholder-[#2e1f3b]/40 focus:outline-none ${
                errors.name ? 'border-rose-500' : 'border-[#e9d5ff] focus:border-[#f472b6]'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.name}</p>}
          </div>

          {/* 3. Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
              3. Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, category_id: e.target.value }));
                if (errors.category_id) setErrors((prev) => ({ ...prev, category_id: null }));
              }}
              className={`w-full rounded-xl border bg-[#faf4fb] px-4 py-3 text-sm font-semibold text-[#2e1f3b] focus:outline-none ${
                errors.category_id ? 'border-rose-500' : 'border-[#e9d5ff] focus:border-[#f472b6]'
              }`}
            >
              <option value="">Select Product Category...</option>
              {categories.map((cat) => (
                <option key={cat.id || cat.slug} value={cat.slug || cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.category_id}</p>}
          </div>

          {/* 4. Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
              4. Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, description: e.target.value }));
                if (errors.description) setErrors((prev) => ({ ...prev, description: null }));
              }}
              placeholder="Tell visitors about this item, why it’s great, fabric/material details, and styling tips..."
              className={`w-full rounded-xl border bg-[#faf4fb] px-4 py-3 text-sm font-semibold text-[#2e1f3b] placeholder-[#2e1f3b]/40 focus:outline-none ${
                errors.description ? 'border-rose-500' : 'border-[#e9d5ff] focus:border-[#f472b6]'
              }`}
            />
            {errors.description && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.description}</p>}
          </div>

          {/* 5. Amazon Link */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
              5. Amazon Link / Affiliate URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              value={formData.amazon_url}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  amazon_url: e.target.value,
                  affiliate_url: e.target.value,
                }));
                if (errors.amazon_url) setErrors((prev) => ({ ...prev, amazon_url: null }));
              }}
              placeholder="https://www.amazon.com/dp/... or https://amzn.to/..."
              className={`w-full rounded-xl border bg-[#faf4fb] px-4 py-3 text-sm font-semibold text-[#2e1f3b] placeholder-[#2e1f3b]/40 focus:outline-none ${
                errors.amazon_url ? 'border-rose-500' : 'border-[#e9d5ff] focus:border-[#f472b6]'
              }`}
            />
            {errors.amazon_url && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.amazon_url}</p>}
          </div>
        </div>

        {/* Collapsible Optional Extra Details */}
        <div className="rounded-[28px] border border-[#e9d5ff] bg-white p-6 space-y-4 shadow-sm">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-left text-sm font-bold text-[#2e1f3b]"
          >
            <span>Optional Details (Price, Brand, Tags, Status)</span>
            <span className="text-xs font-bold text-[#ec4899]">
              {showAdvanced ? '▲ Hide Optional Fields' : '▼ Show Optional Fields'}
            </span>
          </button>

          {showAdvanced && (
            <div className="pt-4 grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="999"
                  className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2.5 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1">
                  Original Price (₹)
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.original_price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, original_price: e.target.value }))}
                  placeholder="1499"
                  className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2.5 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                  placeholder="e.g. Lavs Studio Pick"
                  className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2.5 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tagsInput}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tagsInput: e.target.value }))}
                  placeholder="Fashion, Summer, Pinterest"
                  className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2.5 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 md:col-span-2 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-[#2e1f3b] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                    className="h-4 w-4 rounded border-[#e9d5ff] text-[#ec4899]"
                  />
                  Featured Product on Homepage
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-[#2e1f3b] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData((prev) => ({ ...prev, published: e.target.checked }))}
                    className="h-4 w-4 rounded border-[#e9d5ff] text-[#ec4899]"
                  />
                  Published Immediately
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#e9d5ff]">
          <Link
            to="/admin/products"
            className="rounded-full border border-[#e9d5ff] bg-white px-6 py-3 text-sm font-bold text-[#2e1f3b] hover:bg-[#fde8f3]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || isUploadingImage}
            className="rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-8 py-3 text-sm font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving Product...' : isEdit ? 'Update Product' : 'Publish Product'}
          </button>
        </div>
      </form>

      {/* Media Library Picker Modal */}
      {isMediaPickerOpen && (
        <MediaPickerModal
          isOpen={isMediaPickerOpen}
          onClose={() => setIsMediaPickerOpen(false)}
          onSelectImage={(url) => {
            setFormData((prev) => ({ ...prev, image_url: url }));
            setImagePreview(url);
            setImageFile(null);
            setIsMediaPickerOpen(false);
            if (errors.image) setErrors((prev) => ({ ...prev, image: null }));
          }}
        />
      )}
    </div>
  );
}
