import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { blogPosts as fallbackBlogPosts } from '../blog/posts';

function blocksToMarkdown(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) return '';
  return blocks
    .map((b) => {
      if (typeof b === 'string') return b;
      if (b.type === 'heading') return `## ${b.text}`;
      if (b.type === 'quote') return `> ${b.text}`;
      if (b.type === 'list') return `- ${b.text}`;
      return b.text || '';
    })
    .join('\n\n');
}

export default function AdminBlogForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [isLoadingPost, setIsLoadingPost] = useState(isEdit);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    cover_image: '',
    category_id: '',
    author: 'Lavs Studio Team',
    tagsInput: '',
    markdownContent: '',
    seo_title: '',
    seo_description: '',
    published: true,
    published_at: new Date().toISOString().slice(0, 16),
  });

  // Cover Image upload/preview
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Auto-slug tracking
  const [autoSlug, setAutoSlug] = useState(!isEdit);

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  useEffect(() => {
    async function loadInitialData() {
      try {
        if (supabase && isSupabaseConfigured) {
          const { data: catData } = await supabase
            .from('categories')
            .select('id, name')
            .order('name');
          if (catData) setCategories(catData);
        }

        if (isEdit) {
          let postData = null;
          if (supabase && isSupabaseConfigured) {
            try {
              const { data } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('id', id)
                .single();
              if (data) postData = data;
            } catch (e) {
              console.warn('Supabase post load failed, checking fallback:', e);
            }
          }

          if (!postData) {
            const fb = fallbackBlogPosts.find(
              (p) => String(p.id) === String(id) || String(p.slug) === String(id)
            );
            if (fb) {
              postData = {
                title: fb.title,
                slug: fb.id,
                excerpt: fb.excerpt,
                cover_image: fb.image,
                author: fb.author,
                tags: fb.tags,
                content: fb.content,
                published: true,
                published_at: new Date().toISOString(),
              };
            }
          }

          if (postData) {
            const parsedMd = blocksToMarkdown(postData.content);

            setFormData({
              title: postData.title || '',
              slug: postData.slug || '',
              excerpt: postData.excerpt || '',
              cover_image: postData.cover_image || postData.image || '',
              category_id: postData.category_id || postData.category || '',
              author: postData.author || 'Lavs Studio Team',
              tagsInput: (postData.tags || []).join(', '),
              markdownContent: parsedMd,
              seo_title: postData.seo_title || postData.title || '',
              seo_description: postData.seo_description || postData.excerpt || '',
              published: Boolean(postData.published),
              published_at: postData.published_at
                ? new Date(postData.published_at).toISOString().slice(0, 16)
                : new Date().toISOString().slice(0, 16),
            });

            const img = postData.cover_image || postData.image;
            if (img) {
              setCoverPreview(img);
            }
          }
        }
      } catch (err) {
        console.error('Error loading article:', err);
        showNotification('error', `Failed to load article: ${err.message}`);
      } finally {
        setIsLoadingPost(false);
      }
    }

    loadInitialData();
  }, [id, isEdit]);

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: autoSlug ? generateSlug(val) : prev.slug,
      seo_title: prev.seo_title === prev.title || !prev.seo_title ? val : prev.seo_title,
    }));
    if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
  };

  const handleSlugChange = (e) => {
    setAutoSlug(false);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
    if (errors.slug) setErrors((prev) => ({ ...prev, slug: null }));
  };

  const handleCoverSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotification('error', 'Please select a valid image file.');
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const uploadCoverToStorage = async (file) => {
    setIsUploadingCover(true);
    try {
      if (!supabase) return URL.createObjectURL(file);
      const fileExt = file.name.split('.').pop();
      const fileName = `blog/${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('website-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('website-images')
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (err) {
      return URL.createObjectURL(file);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showNotification('error', 'Please fix validation errors before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalCoverUrl = formData.cover_image.trim() || coverPreview;

      if (coverFile) {
        finalCoverUrl = await uploadCoverToStorage(coverFile);
      }

      const payload = {
        id: isEdit ? id : `blog-${Date.now()}`,
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        excerpt: formData.excerpt.trim() || null,
        cover_image: finalCoverUrl || null,
        image: finalCoverUrl || null,
        category: formData.category_id || 'Fashion',
        category_id: formData.category_id || null,
        author: formData.author.trim() || 'Lavs Studio Team',
        tags: formData.tagsInput
          ? formData.tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        content: [{ type: 'paragraph', text: formData.markdownContent.trim() || 'Article content coming soon.' }],
        published: Boolean(formData.published),
        published_at: formData.published_at ? new Date(formData.published_at).toISOString() : new Date().toISOString(),
      };

      if (supabase && isSupabaseConfigured) {
        try {
          await supabase.from('blog_posts').upsert([payload]);
        } catch (err) {
          console.warn('Supabase blog post save warning:', err);
        }
      }

      showNotification('success', isEdit ? 'Article updated successfully!' : 'Article published successfully!');

      setTimeout(() => {
        navigate('/admin/blog');
      }, 1000);
    } catch (err) {
      console.error('Error saving article:', err);
      showNotification('error', `Failed to save article: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPost) {
    return (
      <div className="rounded-[28px] border border-[#e9d5ff] bg-white p-12 text-center text-[#2e1f3b]/70 font-medium animate-pulse">
        Loading article details...
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
            to="/admin/blog"
            className="text-xs font-bold uppercase tracking-wider text-[#ec4899] hover:underline"
          >
            ← Back to Blog Posts
          </Link>
          <h2 className="mt-2 text-3xl font-bold text-[#2e1f3b]">
            {isEdit ? 'Edit Blog Post' : 'Create New Article'}
          </h2>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-[28px] border border-[#e9d5ff] bg-white p-6 sm:p-8 space-y-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#ec4899]">Article Overview</h3>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
              Article Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="e.g. 10 Feminine Wardrobe Essentials for Everyday Elegance"
              className={`w-full rounded-xl border bg-[#faf4fb] px-4 py-3 text-sm font-semibold text-[#2e1f3b] placeholder-[#2e1f3b]/40 focus:outline-none ${
                errors.title ? 'border-rose-500' : 'border-[#e9d5ff] focus:border-[#f472b6]'
              }`}
            />
            {errors.title && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.title}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
              URL Slug <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={handleSlugChange}
              placeholder="e.g. feminine-wardrobe-essentials"
              className={`w-full rounded-xl border bg-[#faf4fb] px-4 py-2.5 text-sm font-semibold text-[#2e1f3b] placeholder-[#2e1f3b]/40 focus:outline-none ${
                errors.slug ? 'border-rose-500' : 'border-[#e9d5ff] focus:border-[#f472b6]'
              }`}
            />
            {errors.slug && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.slug}</p>}
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
              Excerpt / Summary
            </label>
            <textarea
              rows={2}
              value={formData.excerpt}
              onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
              placeholder="A short catchy summary displayed on article cards..."
              className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2.5 text-sm font-semibold text-[#2e1f3b] placeholder-[#2e1f3b]/40 focus:border-[#f472b6] focus:outline-none"
            />
          </div>

          {/* Cover Image Upload */}
          <div className="grid gap-4 md:grid-cols-[1fr_120px] items-center">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
                Cover Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverSelect}
                className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-3 py-2 text-xs font-semibold text-[#2e1f3b] file:mr-3 file:rounded-lg file:border-0 file:bg-[#fde8f3] file:px-3 file:py-1 file:text-xs file:font-bold file:text-[#ec4899]"
              />
              <input
                type="text"
                placeholder="Or paste image URL..."
                value={formData.cover_image}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, cover_image: e.target.value }));
                  setCoverPreview(e.target.value);
                }}
                className="mt-2 w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2 text-xs font-semibold text-[#2e1f3b] placeholder-[#2e1f3b]/40 focus:border-[#f472b6] focus:outline-none"
              />
            </div>

            <div className="h-24 w-full overflow-hidden rounded-xl border border-[#e9d5ff] bg-[#fde8f3]/30 flex items-center justify-center">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[10px] font-bold text-[#2e1f3b]/40">No Cover</span>
              )}
            </div>
          </div>

          {/* Content Text Area */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
              Article Body Content
            </label>
            <textarea
              rows={10}
              value={formData.markdownContent}
              onChange={(e) => setFormData((prev) => ({ ...prev, markdownContent: e.target.value }))}
              placeholder="Write your article text here..."
              className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-3 text-sm font-semibold text-[#2e1f3b] placeholder-[#2e1f3b]/40 focus:border-[#f472b6] focus:outline-none"
            />
          </div>

          {/* Category & Author */}
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
                Category
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, category_id: e.target.value }))}
                className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2.5 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
              >
                <option value="Fashion">Fashion</option>
                <option value="Dresses">Dresses</option>
                <option value="Jewellery">Jewellery</option>
                <option value="Hair Care">Hair Care</option>
                <option value="Skin Care">Skin Care</option>
                <option value="Beauty">Beauty</option>
                <option value="Amazon Finds">Amazon Finds</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
                Author
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2.5 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#e9d5ff]">
          <Link
            to="/admin/blog"
            className="rounded-full border border-[#e9d5ff] bg-white px-6 py-3 text-sm font-bold text-[#2e1f3b] hover:bg-[#fde8f3]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || isUploadingCover}
            className="rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-8 py-3 text-sm font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Post' : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
