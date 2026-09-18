import { useEffect, useState } from 'react';
import MediaPickerModal from '../components/MediaPickerModal';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { saveLocalCategories } from '../lib/content';

const INITIAL_CATEGORIES_DATA = [
  { id: 'cat-1', name: 'Fashion', slug: 'fashion', description: 'Elevated staples, dresses, and everyday style edits.', image: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=800&q=80', display_order: 1, active: true },
  { id: 'cat-2', name: 'Dresses', slug: 'dresses', description: 'Feminine, Pinterest-ready dresses for every occasion.', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80', display_order: 2, active: true },
  { id: 'cat-3', name: 'Jewellery', slug: 'jewellery', description: 'Dainty gold hoops, layered chains, and everyday shine.', image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=80', display_order: 3, active: true },
  { id: 'cat-4', name: 'Hair Care', slug: 'hair-care', description: 'Routine staples, serums, and heatless styling finds.', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80', display_order: 4, active: true },
  { id: 'cat-5', name: 'Skin Care', slug: 'skin-care', description: 'Gentle hydration, Korean beauty favourites, and glowing skin essentials.', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', display_order: 5, active: true },
  { id: 'cat-6', name: 'Beauty', slug: 'beauty', description: 'Everyday makeup, lip tints, and soft-glam picks.', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80', display_order: 6, active: true },
  { id: 'cat-7', name: 'Amazon Finds', slug: 'amazon-finds', description: 'Curated budget-friendly picks directly from Amazon.', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80', display_order: 7, active: true },
];

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    display_order: 0,
    active: true,
  });

  // Image Upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Auto-slug tracking
  const [autoSlug, setAutoSlug] = useState(true);

  // Deletion Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Toast Notification
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      if (!supabase || !isSupabaseConfigured) {
        const raw = localStorage.getItem('lavsstudio_custom_categories');
        const parsed = raw ? JSON.parse(raw) : null;
        setCategories(parsed || INITIAL_CATEGORIES_DATA);
        return;
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        const raw = localStorage.getItem('lavsstudio_custom_categories');
        const parsed = raw ? JSON.parse(raw) : null;
        setCategories(parsed || INITIAL_CATEGORIES_DATA);
      } else {
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      const raw = localStorage.getItem('lavsstudio_custom_categories');
      const parsed = raw ? JSON.parse(raw) : null;
      setCategories(parsed || INITIAL_CATEGORIES_DATA);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSeedInitialCategories = async () => {
    setIsLoading(true);
    try {
      if (supabase && isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('categories')
          .insert(INITIAL_CATEGORIES_DATA)
          .select('*');

        if (!error && data) {
          setCategories(data);
          saveLocalCategories(data);
          showNotification('success', 'Initial categories created in database!');
          return;
        }
      }

      setCategories(INITIAL_CATEGORIES_DATA);
      saveLocalCategories(INITIAL_CATEGORIES_DATA);
      showNotification('success', 'Categories reset to initial defaults!');
    } catch (err) {
      console.error('Error seeding categories:', err);
      setCategories(INITIAL_CATEGORIES_DATA);
      saveLocalCategories(INITIAL_CATEGORIES_DATA);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (category) => {
    const newActive = !category.active;
    const updated = categories.map((c) => (c.id === category.id ? { ...c, active: newActive } : c));
    setCategories(updated);
    saveLocalCategories(updated);

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('categories')
          .update({ active: newActive })
          .eq('id', category.id);
      } catch (err) {
        console.warn('Supabase toggle category active error:', err);
      }
    }

    showNotification(
      'success',
      `Category "${category.name}" is now ${newActive ? 'Enabled' : 'Disabled'}.`
    );
  };

  const handleMove = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCategories = [...categories];
    const catA = newCategories[index];
    const catB = newCategories[targetIndex];

    const orderA = catA.display_order;
    const orderB = catB.display_order;

    catA.display_order = orderB;
    catB.display_order = orderA;

    newCategories[index] = catB;
    newCategories[targetIndex] = catA;

    setCategories(newCategories);
    saveLocalCategories(newCategories);

    if (supabase && isSupabaseConfigured) {
      try {
        await Promise.all([
          supabase.from('categories').update({ display_order: catA.display_order }).eq('id', catA.id),
          supabase.from('categories').update({ display_order: catB.display_order }).eq('id', catB.id),
        ]);
      } catch (err) {
        console.warn('Supabase reorder categories error:', err);
      }
    }

    showNotification('success', 'Category order updated.');
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        image: category.image || '',
        display_order: category.display_order || 0,
        active: Boolean(category.active),
      });
      setImagePreview(category.image || null);
      setAutoSlug(false);
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        image: '',
        display_order: categories.length + 1,
        active: true,
      });
      setImagePreview(null);
      setAutoSlug(true);
    }
    setImageFile(null);
    setIsModalOpen(true);
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
    }
  };

  const uploadCategoryImage = async (file) => {
    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `categories/${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('website-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      showNotification('error', 'Category Name and Slug are required.');
      return;
    }

    setIsSaving(true);
    try {
      let finalImageUrl = formData.image;

      if (imageFile) {
        try {
          finalImageUrl = await uploadCategoryImage(imageFile);
        } catch (uploadErr) {
          console.warn('Category image upload failed, using preview:', uploadErr);
          if (imagePreview) finalImageUrl = imagePreview;
        }
      }

      const catId = editingCategory ? editingCategory.id : `cat-${Date.now()}`;
      const payload = {
        id: catId,
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
        image: finalImageUrl || null,
        display_order: parseInt(formData.display_order, 10) || categories.length + 1,
        active: Boolean(formData.active),
      };

      const updatedCategories = editingCategory
        ? categories.map((c) => (c.id === editingCategory.id ? { ...c, ...payload } : c))
        : [payload, ...categories];

      setCategories(updatedCategories);
      saveLocalCategories(updatedCategories);

      if (supabase && isSupabaseConfigured) {
        try {
          await supabase.from('categories').upsert([payload]);
        } catch (dbErr) {
          console.warn('Supabase category save error:', dbErr);
        }
      }

      showNotification('success', editingCategory ? 'Category updated!' : 'Category created!');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving category:', err);
      showNotification('error', `Failed to save category: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExecute = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const updated = categories.filter((c) => String(c.id) !== String(deleteTarget.id));
      setCategories(updated);
      saveLocalCategories(updated);

      if (supabase && isSupabaseConfigured) {
        try {
          await supabase.from('categories').delete().eq('id', deleteTarget.id);
        } catch (err) {
          console.warn('Supabase delete category error:', err);
        }
      }

      showNotification('success', `Category "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting category:', err);
      showNotification('error', `Failed to delete category: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Header & Create Button */}
      <div className="flex flex-col gap-4 border-b border-[#e9d5ff]/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#ec4899]">
            Taxonomy
          </p>
          <h2 className="mt-1 text-3xl font-bold text-[#2e1f3b]">Categories</h2>
          <p className="mt-1 text-sm font-medium text-[#2e1f3b]/75">
            Manage product & blog categories, display ordering, images, and visibility.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {categories.length === 0 && !isLoading && (
            <button
              onClick={handleSeedInitialCategories}
              className="rounded-full border border-[#e9d5ff] bg-white px-4 py-2.5 text-sm font-bold text-[#2e1f3b] hover:bg-[#fde8f3]"
            >
              + Seed Default Categories
            </button>
          )}
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-95 shadow-md"
          >
            <span>+</span> Add Category
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-[24px] border border-[#e9d5ff] bg-white p-4 max-w-md shadow-sm">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
          Search Categories
        </label>
        <input
          type="text"
          placeholder="Search by name, slug, description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-3.5 py-2 text-sm font-semibold text-[#2e1f3b] placeholder-[#2e1f3b]/40 focus:border-[#f472b6] focus:outline-none"
        />
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="rounded-[28px] border border-[#e9d5ff] bg-white p-12 text-center text-[#2e1f3b]/70 font-medium animate-pulse">
          Loading categories...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="rounded-[28px] border border-[#e9d5ff] bg-white p-12 text-center shadow-sm">
          <p className="text-lg font-bold text-[#2e1f3b]">No categories found</p>
          <p className="mt-2 text-sm text-[#2e1f3b]/70 max-w-md mx-auto">
            {categories.length === 0
              ? 'Click below to seed default categories.'
              : 'Try changing your search term.'}
          </p>
          {categories.length === 0 && (
            <button
              onClick={handleSeedInitialCategories}
              className="mt-6 rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-6 py-2.5 text-sm font-bold text-white shadow-md"
            >
              Seed Initial Categories
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-[#e9d5ff] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#2e1f3b]">
              <thead className="border-b border-[#e9d5ff] bg-[#fde8f3]/60 text-xs font-bold uppercase tracking-wider text-[#2e1f3b]">
                <tr>
                  <th scope="col" className="py-4 px-4 text-center">Order</th>
                  <th scope="col" className="py-4 px-4">Category</th>
                  <th scope="col" className="py-4 px-4">Slug</th>
                  <th scope="col" className="py-4 px-4">Description</th>
                  <th scope="col" className="py-4 px-4 text-center">Status</th>
                  <th scope="col" className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9d5ff]/60">
                {filteredCategories.map((cat, idx) => (
                  <tr key={cat.id} className="transition hover:bg-[#faf4fb]">
                    {/* Order Controls */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, 'up')}
                          title="Move Up"
                          className="rounded p-1 text-xs border border-[#e9d5ff] bg-white text-[#2e1f3b] hover:bg-[#f3e8ff] disabled:opacity-30"
                        >
                          ▲
                        </button>
                        <span className="font-mono text-xs font-bold text-[#ec4899]">
                          #{cat.display_order ?? idx + 1}
                        </span>
                        <button
                          type="button"
                          disabled={idx === filteredCategories.length - 1}
                          onClick={() => handleMove(idx, 'down')}
                          title="Move Down"
                          className="rounded p-1 text-xs border border-[#e9d5ff] bg-white text-[#2e1f3b] hover:bg-[#f3e8ff] disabled:opacity-30"
                        >
                          ▼
                        </button>
                      </div>
                    </td>

                    {/* Category Image & Name */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl border border-[#e9d5ff] bg-[#faf4fb]">
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/150?text=No+Img';
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[9px] text-[#2e1f3b]/40 font-bold">
                              No image
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-[#2e1f3b]">{cat.name}</span>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-3 px-4 font-mono text-xs text-[#ec4899] font-semibold whitespace-nowrap">
                      /{cat.slug}
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 text-xs font-medium text-[#2e1f3b]/70 max-w-xs truncate">
                      {cat.description || '—'}
                    </td>

                    {/* Status Pill Toggle */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(cat)}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition cursor-pointer ${
                          cat.active
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-gray-100 text-gray-600 border border-gray-300'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            cat.active ? 'bg-emerald-500' : 'bg-gray-400'
                          }`}
                        />
                        {cat.active ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(cat)}
                          className="rounded-full border border-[#f472b6]/40 bg-[#fde8f3] px-3.5 py-1 text-xs font-bold text-[#2e1f3b] hover:bg-[#f472b6] hover:text-white transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat)}
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

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="my-8 w-full max-w-lg rounded-[32px] border border-[#e9d5ff] bg-white p-6 shadow-2xl space-y-6 text-[#2e1f3b]">
            <div className="flex items-center justify-between border-b border-[#e9d5ff] pb-4">
              <h3 className="text-xl font-bold text-[#2e1f3b]">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#2e1f3b]/60 hover:text-[#2e1f3b] text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name: val,
                      slug: autoSlug ? generateSlug(val) : prev.slug,
                    }));
                  }}
                  placeholder="e.g. Skin Care"
                  className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2.5 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => {
                    setAutoSlug(false);
                    setFormData((prev) => ({ ...prev, slug: e.target.value }));
                  }}
                  placeholder="e.g. skin-care"
                  className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2.5 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Short description displayed on category cards..."
                  className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2.5 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
                />
              </div>

              {/* Category Image Upload */}
              <div className="grid gap-4 md:grid-cols-[1fr_90px] items-center">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b]">
                      Category Image
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="text-[11px] font-bold text-[#ec4899] hover:underline"
                    >
                      📷 Pick from Library
                    </button>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileSelect}
                    className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-3 py-2 text-xs font-semibold text-[#2e1f3b] file:mr-3 file:rounded-lg file:border-0 file:bg-[#fde8f3] file:px-3 file:py-1 file:text-xs file:font-bold file:text-[#ec4899]"
                  />
                  <input
                    type="text"
                    placeholder="Or paste external image URL..."
                    value={formData.image}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, image: e.target.value }));
                      setImagePreview(e.target.value);
                    }}
                    className="mt-2 w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-3 py-1.5 text-xs font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
                  />
                </div>

                <div className="h-20 w-20 overflow-hidden rounded-xl border border-[#e9d5ff] bg-[#fde8f3]/30 flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150?text=No+Img';
                      }}
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-[#2e1f3b]/40">No Image</span>
                  )}
                </div>
              </div>

              {/* Display Order & Active Switch */}
              <div className="grid gap-4 md:grid-cols-2 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, display_order: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, active: e.target.checked }))
                      }
                      className="h-5 w-5 rounded border-[#e9d5ff] text-[#ec4899] focus:ring-[#f472b6]"
                    />
                    <span className="text-sm font-bold text-[#2e1f3b]">Category Active</span>
                  </label>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-[#e9d5ff] pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-[#e9d5ff] bg-white px-5 py-2 text-sm font-bold text-[#2e1f3b] hover:bg-[#fde8f3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploadingImage}
                  className="rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-6 py-2 text-sm font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50"
                >
                  {isSaving
                    ? 'Saving...'
                    : isUploadingImage
                    ? 'Uploading Image...'
                    : editingCategory
                    ? 'Save Changes'
                    : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[28px] border border-[#e9d5ff] bg-white p-6 shadow-2xl space-y-4 text-[#2e1f3b]">
            <h3 className="text-lg font-bold text-[#2e1f3b]">Delete Category</h3>
            <p className="text-sm font-medium text-[#2e1f3b]/80">
              Are you sure you want to delete category{' '}
              <strong className="text-[#2e1f3b] font-bold">"{deleteTarget.name}"</strong>? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#e9d5ff]">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="rounded-full border border-[#e9d5ff] bg-white px-4 py-2 text-xs font-bold text-[#2e1f3b] hover:bg-[#fde8f3]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteExecute}
                disabled={isDeleting}
                className="rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => {
          setFormData((prev) => ({ ...prev, image: url }));
          setImagePreview(url);
          setImageFile(null);
        }}
        targetFolder="categories"
      />
    </div>
  );
}
