import MediaPickerModal from '../components/MediaPickerModal';

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

  // Image Upload State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Validation Errors & Saving state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Auto-slug tracking
  const [autoSlug, setAutoSlug] = useState(!isEdit);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Helper to generate slug from product name
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  // Fetch categories and existing product data
  useEffect(() => {
    async function loadInitialData() {
      try {
        // Fetch categories
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('id, name')
          .order('name');

        if (catError) console.error('Error loading categories:', catError);
        else setCategories(catData || []);

        // Fetch product if editing
        if (isEdit) {
          const { data: prodData, error: prodError } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

          if (prodError) throw prodError;

          if (prodData) {
            setFormData({
              name: prodData.name || '',
              slug: prodData.slug || '',
              short_description: prodData.short_description || '',
              description: prodData.description || '',
              category_id: prodData.category_id || '',
              brand: prodData.brand || '',
              price: prodData.price !== null ? String(prodData.price) : '',
              original_price:
                prodData.original_price !== null ? String(prodData.original_price) : '',
              discount: prodData.discount !== null ? String(prodData.discount) : '',
              image_url: prodData.image_url || '',
              amazon_url: prodData.amazon_url || '',
              affiliate_url: prodData.affiliate_url || '',
              rating: prodData.rating !== null ? String(prodData.rating) : '',
              tagsInput: (prodData.tags || []).join(', '),
              featured: Boolean(prodData.featured),
              published: Boolean(prodData.published),
            });
            if (prodData.image_url) {
              setImagePreview(prodData.image_url);
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

  // Handle Name Change with Auto-Slug
  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: autoSlug ? generateSlug(val) : prev.slug,
    }));
    if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
  };

  // Handle Slug Change
  const handleSlugChange = (e) => {
    setAutoSlug(false);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
    if (errors.slug) setErrors((prev) => ({ ...prev, slug: null }));
  };

  // Handle Price / Original Price Auto-Discount Calculation
  const handlePriceChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Calculate discount if price & original price exist
      const p = parseFloat(field === 'price' ? value : prev.price);
      const op = parseFloat(field === 'original_price' ? value : prev.original_price);

      if (op > 0 && p >= 0 && p < op) {
        const disc = Math.round(((op - p) / op) * 100);
        updated.discount = String(disc);
      }
      return updated;
    });

    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  // Image File selection
  const handleImageFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotification('error', 'Please select a valid image file.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Upload image to Supabase Storage bucket 'website-images'
  const uploadImageToStorage = async (file) => {
    setIsUploadingImage(true);
    try {
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
        console.error('Storage upload error:', error);
        throw new Error(`Storage upload failed: ${error.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from('website-images')
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Form Validation logic
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Full description is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Price must be a valid number >= 0';
    }

    if (
      formData.original_price &&
      (isNaN(formData.original_price) || parseFloat(formData.original_price) < 0)
    ) {
      newErrors.original_price = 'Original price must be a valid number >= 0';
    }

    if (
      formData.discount &&
      (isNaN(formData.discount) || parseFloat(formData.discount) < 0)
    ) {
      newErrors.discount = 'Discount must be a valid number >= 0';
    }

    if (formData.rating) {
      const r = parseFloat(formData.rating);
      if (isNaN(r) || r < 0 || r > 5) {
        newErrors.rating = 'Rating must be a number between 0 and 5';
      }
    }

    const urlPattern = /^https?:\/\/.+/i;
    if (formData.amazon_url && !urlPattern.test(formData.amazon_url.trim())) {
      newErrors.amazon_url = 'Amazon URL must start with http:// or https://';
    }

    if (formData.affiliate_url && !urlPattern.test(formData.affiliate_url.trim())) {
      newErrors.affiliate_url = 'Affiliate URL must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showNotification('error', 'Please fix validation errors before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.image_url;

      // If a file was selected, upload it first
      if (imageFile) {
        try {
          finalImageUrl = await uploadImageToStorage(imageFile);
        } catch (uploadErr) {
          showNotification(
            'error',
            `Image upload failed: ${uploadErr.message}. Check if 'website-images' bucket exists in your Supabase Storage.`
          );
          setIsSubmitting(false);
          return;
        }
      }

      // Build product database payload
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        short_description: formData.short_description.trim() || null,
        description: formData.description.trim(),
        category_id: formData.category_id || null,
        brand: formData.brand.trim() || null,
        price: parseFloat(formData.price) || 0,
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        discount: formData.discount ? parseFloat(formData.discount) : null,
        image_url: finalImageUrl || null,
        amazon_url: formData.amazon_url.trim() || null,
        affiliate_url: formData.affiliate_url.trim() || null,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        tags: formData.tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        featured: Boolean(formData.featured),
        published: Boolean(formData.published),
      };

      if (isEdit) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', id);

        if (error) throw error;
        showNotification('success', 'Product updated successfully!');
      } else {
        const { error } = await supabase.from('products').insert([payload]);

        if (error) throw error;
        showNotification('success', 'Product created successfully!');
      }

      // Redirect back after a short delay
      setTimeout(() => {
        navigate('/admin/products');
      }, 1200);
    } catch (err) {
      console.error('Error saving product:', err);
      showNotification('error', `Failed to save product: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-12 text-center text-white/60 animate-pulse">
        Loading product details...
      </div>
    );
  }

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

      {/* Header & Back Link */}
      <div className="flex flex-col gap-2 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/admin/products"
            className="text-xs font-semibold uppercase tracking-wider text-[#e2a4a4] hover:underline"
          >
            ← Back to Products List
          </Link>
          <h2 className="mt-2 text-3xl font-semibold">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 space-y-5">
          <h3 className="text-lg font-semibold text-[#e2a4a4]">1. Basic Details</h3>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Product Name */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                Product Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g. Vintage Gold Hoop Earrings"
                className={`w-full rounded-xl border bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none ${
                  errors.name ? 'border-rose-500' : 'border-white/10 focus:border-[#e2a4a4]'
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                URL Slug <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={handleSlugChange}
                placeholder="e.g. vintage-gold-hoop-earrings"
                className={`w-full rounded-xl border bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none ${
                  errors.slug ? 'border-rose-500' : 'border-white/10 focus:border-[#e2a4a4]'
                }`}
              />
              {errors.slug && <p className="mt-1 text-xs text-rose-400">{errors.slug}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                Category
              </label>
              <select
                value={formData.category_id}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category_id: e.target.value }))
                }
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white focus:border-[#e2a4a4] focus:outline-none"
              >
                <option value="" className="bg-[#130d11] text-white">Select Category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#130d11] text-white">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                Brand
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, brand: e.target.value }))
                }
                placeholder="e.g. Lavs Studio Select"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#e2a4a4] focus:outline-none"
              />
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
              Short Description (Excerpt)
            </label>
            <input
              type="text"
              value={formData.short_description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, short_description: e.target.value }))
              }
              placeholder="Brief summary displayed on product cards..."
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#e2a4a4] focus:outline-none"
            />
          </div>

          {/* Full Description */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
              Full Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={5}
              value={formData.description}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, description: e.target.value }));
                if (errors.description)
                  setErrors((prev) => ({ ...prev, description: null }));
              }}
              placeholder="Detailed product overview, features, specs, and styling recommendations..."
              className={`w-full rounded-xl border bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none ${
                errors.description ? 'border-rose-500' : 'border-white/10 focus:border-[#e2a4a4]'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-400">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Section 2: Pricing & Affiliate Links */}
        <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 space-y-5">
          <h3 className="text-lg font-semibold text-[#e2a4a4]">
            2. Pricing & Affiliate Information
          </h3>

          <div className="grid gap-5 md:grid-cols-3">
            {/* Price */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                Current Price ($) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handlePriceChange('price', e.target.value)}
                placeholder="29.99"
                className={`w-full rounded-xl border bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none ${
                  errors.price ? 'border-rose-500' : 'border-white/10 focus:border-[#e2a4a4]'
                }`}
              />
              {errors.price && <p className="mt-1 text-xs text-rose-400">{errors.price}</p>}
            </div>

            {/* Original Price */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                Original Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.original_price}
                onChange={(e) => handlePriceChange('original_price', e.target.value)}
                placeholder="49.99"
                className={`w-full rounded-xl border bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none ${
                  errors.original_price ? 'border-rose-500' : 'border-white/10 focus:border-[#e2a4a4]'
                }`}
              />
              {errors.original_price && (
                <p className="mt-1 text-xs text-rose-400">{errors.original_price}</p>
              )}
            </div>

            {/* Discount */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                Discount (%)
              </label>
              <input
                type="number"
                step="1"
                value={formData.discount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, discount: e.target.value }))
                }
                placeholder="40"
                className={`w-full rounded-xl border bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none ${
                  errors.discount ? 'border-rose-500' : 'border-white/10 focus:border-[#e2a4a4]'
                }`}
              />
              {errors.discount && <p className="mt-1 text-xs text-rose-400">{errors.discount}</p>}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Amazon URL */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                Amazon Product URL
              </label>
              <input
                type="url"
                value={formData.amazon_url}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, amazon_url: e.target.value }));
                  if (errors.amazon_url)
                    setErrors((prev) => ({ ...prev, amazon_url: null }));
                }}
                placeholder="https://www.amazon.com/dp/..."
                className={`w-full rounded-xl border bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none ${
                  errors.amazon_url ? 'border-rose-500' : 'border-white/10 focus:border-[#e2a4a4]'
                }`}
              />
              {errors.amazon_url && (
                <p className="mt-1 text-xs text-rose-400">{errors.amazon_url}</p>
              )}
            </div>

            {/* Affiliate URL */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                Affiliate Link (Tag / Storefront)
              </label>
              <input
                type="url"
                value={formData.affiliate_url}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, affiliate_url: e.target.value }));
                  if (errors.affiliate_url)
                    setErrors((prev) => ({ ...prev, affiliate_url: null }));
                }}
                placeholder="https://amzn.to/... or custom affiliate link"
                className={`w-full rounded-xl border bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none ${
                  errors.affiliate_url ? 'border-rose-500' : 'border-white/10 focus:border-[#e2a4a4]'
                }`}
              />
              {errors.affiliate_url && (
                <p className="mt-1 text-xs text-rose-400">{errors.affiliate_url}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Product Media (Supabase Storage) */}
        <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#e2a4a4]">3. Product Image</h3>
            <button
              type="button"
              onClick={() => setIsMediaPickerOpen(true)}
              className="rounded-full border border-[#e2a4a4]/30 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white transition hover:border-[#e2a4a4] hover:bg-[#e2a4a4]/10"
            >
              📷 Choose from Media Library
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_200px]">
            <div className="space-y-4">
              {/* File Upload to Supabase Storage */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                  Upload Image File (Supabase Storage)
                </label>
                <div className="relative flex min-h-[110px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-4 text-center transition hover:border-[#e2a4a4] hover:bg-white/10">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileSelect}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  <p className="text-sm font-medium text-white/80">
                    {imageFile ? `Selected: ${imageFile.name}` : 'Click or Drag & Drop image file to upload'}
                  </p>
                  <p className="mt-1 text-xs text-white/40">
                    Uploads directly to Supabase Storage bucket <code className="text-[#e2a4a4]">website-images</code>
                  </p>
                </div>
              </div>

              {/* Direct Image URL input as fallback */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                  Or Paste External Image URL
                </label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, image_url: e.target.value }));
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#e2a4a4] focus:outline-none"
                />
              </div>
            </div>

            {/* Image Preview Box */}
            <div className="flex flex-col items-center justify-center">
              <span className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-2">
                Image Preview
              </span>
              <div className="h-36 w-36 overflow-hidden rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150?text=Invalid+Image';
                    }}
                  />
                ) : (
                  <span className="text-xs text-white/30">No Image</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Metadata & Visibility */}
        <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 space-y-5">
          <h3 className="text-lg font-semibold text-[#e2a4a4]">4. Metadata & Publishing</h3>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Rating */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                Rating (0.0 to 5.0)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, rating: e.target.value }))
                }
                placeholder="4.8"
                className={`w-full rounded-xl border bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none ${
                  errors.rating ? 'border-rose-500' : 'border-white/10 focus:border-[#e2a4a4]'
                }`}
              />
              {errors.rating && <p className="mt-1 text-xs text-rose-400">{errors.rating}</p>}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={formData.tagsInput}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tagsInput: e.target.value }))
                }
                placeholder="earrings, gold, jewelry, gift"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#e2a4a4] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-8 pt-2">
            {/* Featured Toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, featured: e.target.checked }))
                }
                className="h-5 w-5 rounded border-white/20 bg-black/50 text-[#e2a4a4] focus:ring-[#e2a4a4]"
              />
              <div>
                <span className="text-sm font-semibold text-white">Featured Product</span>
                <p className="text-xs text-white/50">Highlight this item in homepage featured sections</p>
              </div>
            </label>

            {/* Published Toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, published: e.target.checked }))
                }
                className="h-5 w-5 rounded border-white/20 bg-black/50 text-[#e2a4a4] focus:ring-[#e2a4a4]"
              />
              <div>
                <span className="text-sm font-semibold text-white">Publish Immediately</span>
                <p className="text-xs text-white/50">Make publicly visible to storefront visitors</p>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 border-t border-white/10 pt-6">
          <Link
            to="/admin/products"
            className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm text-white hover:bg-white/10"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || isUploadingImage}
            className="rounded-full bg-[#e2a4a4] px-8 py-2.5 text-sm font-semibold text-[#130d11] transition hover:bg-[#efb3b3] shadow-lg shadow-[#e2a4a4]/20 disabled:opacity-50"
          >
            {isSubmitting
              ? 'Saving to Supabase...'
              : isUploadingImage
              ? 'Uploading Image...'
              : isEdit
              ? 'Save Product Changes'
              : 'Create Product'}
          </button>
        </div>
      </form>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => {
          setFormData((prev) => ({ ...prev, image_url: url }));
          setImagePreview(url);
          setImageFile(null);
        }}
        targetFolder="products"
      />
    </div>
  );
}
