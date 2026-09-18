import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Convert Markdown text into block array [{ type: 'heading'|'paragraph'|'quote'|'list', text: '...' }]
function parseMarkdownToBlocks(markdownText) {
  if (!markdownText) return [];
  const lines = markdownText.split('\n');
  const blocks = [];
  let paragraphLines = [];

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paragraphLines.join(' ') });
      paragraphLines = [];
    }
  };

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      continue;
    }

    if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      flushParagraph();
      const headingText = trimmed.replace(/^#+\s*/, '');
      blocks.push({ type: 'heading', text: headingText });
    } else if (trimmed.startsWith('> ')) {
      flushParagraph();
      blocks.push({ type: 'quote', text: trimmed.replace(/^>\s*/, '') });
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushParagraph();
      blocks.push({ type: 'list', text: trimmed.replace(/^[-*]\s*/, '') });
    } else {
      paragraphLines.push(trimmed);
    }
  }

  flushParagraph();
  return blocks;
}

// Convert block array back into Markdown text for editing
function blocksToMarkdown(blocks) {
  if (!blocks) return '';
  if (typeof blocks === 'string') return blocks;
  if (!Array.isArray(blocks)) return '';

  return blocks
    .map((b) => {
      if (b.type === 'heading') return `## ${b.text}`;
      if (b.type === 'quote') return `> ${b.text}`;
      if (b.type === 'list') return `- ${b.text}`;
      return b.text;
    })
    .join('\n\n');
}

import MediaPickerModal from '../components/MediaPickerModal';

export default function AdminBlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [isLoadingPost, setIsLoadingPost] = useState(isEdit);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Form Data State
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
    published: false,
    published_at: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
  });

  // Cover Image State
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Editor View Mode ('write' | 'preview' | 'split')
  const [editorMode, setEditorMode] = useState('split');

  // Auto-slug tracking
  const [autoSlug, setAutoSlug] = useState(!isEdit);

  // Validation & Submitting state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper to generate slug from title
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
        // Fetch categories for dropdown
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('id, name')
          .order('name');

        if (catError) console.error('Error fetching categories:', catError);
        else setCategories(catData || []);

        // Load existing post if editing
        if (isEdit) {
          const { data: postData, error: postError } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('id', id)
            .single();

          if (postError) throw postError;

          if (postData) {
            const parsedMd = blocksToMarkdown(postData.content);

            setFormData({
              title: postData.title || '',
              slug: postData.slug || '',
              excerpt: postData.excerpt || '',
              cover_image: postData.cover_image || '',
              category_id: postData.category_id || '',
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

            if (postData.cover_image) {
              setCoverPreview(postData.cover_image);
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

  // Title change with auto-slug
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

  // Manual Slug change
  const handleSlugChange = (e) => {
    setAutoSlug(false);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
    if (errors.slug) setErrors((prev) => ({ ...prev, slug: null }));
  };

  // Excerpt change with auto-SEO description
  const handleExcerptChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      excerpt: val,
      seo_description: prev.seo_description === prev.excerpt || !prev.seo_description ? val : prev.seo_description,
    }));
    if (errors.excerpt) setErrors((prev) => ({ ...prev, excerpt: null }));
  };

  // Cover Image selection
  const handleCoverFileSelect = (e) => {
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

  // Upload Cover Image to Supabase Storage
  const uploadCoverToStorage = async (file) => {
    setIsUploadingCover(true);
    try {
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

      if (error) {
        throw new Error(`Storage upload failed: ${error.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from('website-images')
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Markdown Toolbar helper
  const insertMarkdownSyntax = (prefix, suffix = '') => {
    const textarea = document.getElementById('blog-markdown-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.markdownContent;
    const selectedText = text.substring(start, end) || 'Sample text';
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setFormData((prev) => ({ ...prev, markdownContent: newContent }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 50);
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.excerpt.trim()) newErrors.excerpt = 'Excerpt is required';
    if (!formData.markdownContent.trim()) newErrors.markdownContent = 'Article content is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showNotification('error', 'Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalCoverUrl = formData.cover_image;

      if (coverFile) {
        try {
          finalCoverUrl = await uploadCoverToStorage(coverFile);
        } catch (uploadErr) {
          showNotification(
            'error',
            `Cover image upload failed: ${uploadErr.message}. Ensure 'website-images' bucket exists.`
          );
          setIsSubmitting(false);
          return;
        }
      }

      // Convert Markdown to Structured JSON block array
      const contentBlocks = parseMarkdownToBlocks(formData.markdownContent);

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        excerpt: formData.excerpt.trim(),
        cover_image: finalCoverUrl || null,
        category_id: formData.category_id || null,
        author: formData.author.trim() || 'Lavs Studio Team',
        tags: formData.tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        content: contentBlocks,
        seo_title: formData.seo_title.trim() || formData.title.trim(),
        seo_description: formData.seo_description.trim() || formData.excerpt.trim(),
        published: Boolean(formData.published),
        published_at: formData.published
          ? new Date(formData.published_at).toISOString()
          : null,
      };

      if (isEdit) {
        const { error } = await supabase
          .from('blog_posts')
          .update(payload)
          .eq('id', id);

        if (error) throw error;
        showNotification('success', 'Article updated successfully!');
      } else {
        const { error } = await supabase.from('blog_posts').insert([payload]);

        if (error) throw error;
        showNotification('success', 'Article created successfully!');
      }

      setTimeout(() => {
        navigate('/admin/blog');
      }, 1200);
    } catch (err) {
      console.error('Error saving article:', err);
      showNotification('error', `Failed to save article: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Live Preview Blocks safely
  const previewBlocks = parseMarkdownToBlocks(formData.markdownContent);

  if (isLoadingPost) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-12 text-center text-white/60 animate-pulse">
        Loading article editor...
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

      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/admin/blog"
            className="text-xs font-semibold uppercase tracking-wider text-[#e2a4a4] hover:underline"
          >
            ← Back to Blog Posts
          </Link>
          <h2 className="mt-2 text-3xl font-semibold">
            {isEdit ? 'Edit Article' : 'Write New Article'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Article Metadata */}
        <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 space-y-5">
          <h3 className="text-lg font-semibold text-[#e2a4a4]">1. Article Metadata</h3>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                Article Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g. 10 Chic Fashion Essentials for Summer"
                className={`w-full rounded-xl border bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none ${
                  errors.title ? 'border-rose-500' : 'border-white/10 focus:border-[#e2a4a4]'
                }`}
              />
              {errors.title && <p className="mt-1 text-xs text-rose-400">{errors.title}</p>}
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
                placeholder="e.g. 10-chic-fashion-essentials-for-summer"
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

            {/* Author */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                Author
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, author: e.target.value }))
                }
                placeholder="Lavs Studio Team"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#e2a4a4] focus:outline-none"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
              Article Excerpt / Summary <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={2}
              value={formData.excerpt}
              onChange={handleExcerptChange}
              placeholder="Short summary displayed on the blog listing and social shares..."
              className={`w-full rounded-xl border bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none ${
                errors.excerpt ? 'border-rose-500' : 'border-white/10 focus:border-[#e2a4a4]'
              }`}
            />
            {errors.excerpt && <p className="mt-1 text-xs text-rose-400">{errors.excerpt}</p>}
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
              placeholder="Fashion, Summer, Style Tips, Pinterest"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#e2a4a4] focus:outline-none"
            />
          </div>
        </div>

        {/* Section 2: Cover Image (Supabase Storage) */}
        <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#e2a4a4]">2. Pinterest Cover Image</h3>
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
              {/* Storage Upload */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                  Upload Cover Image (Supabase Storage)
                </label>
                <div className="relative flex min-h-[110px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-4 text-center transition hover:border-[#e2a4a4] hover:bg-white/10">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileSelect}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  <p className="text-sm font-medium text-white/80">
                    {coverFile ? `Selected: ${coverFile.name}` : 'Click or Drag & Drop vertical pin cover image'}
                  </p>
                  <p className="mt-1 text-xs text-white/40">
                    Uploads directly to Supabase Storage bucket <code className="text-[#e2a4a4]">website-images</code>
                  </p>
                </div>
              </div>

              {/* Direct URL Fallback */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                  Or Paste External Image URL
                </label>
                <input
                  type="text"
                  value={formData.cover_image}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, cover_image: e.target.value }));
                    setCoverPreview(e.target.value);
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#e2a4a4] focus:outline-none"
                />
              </div>
            </div>

            {/* Cover Preview */}
            <div className="flex flex-col items-center justify-center">
              <span className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-2">
                Cover Preview
              </span>
              <div className="h-44 w-32 overflow-hidden rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center shadow-lg">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150?text=Invalid+Cover';
                    }}
                  />
                ) : (
                  <span className="text-xs text-white/30 text-center p-2">No Cover Image</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Markdown Content Editor & Live Preview */}
        <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-semibold text-[#e2a4a4]">
                3. Article Content (Markdown Editor)
              </h3>
              <p className="text-xs text-white/50">
                Write formatted content with live preview. Raw HTML is automatically sanitized.
              </p>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center rounded-full border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setEditorMode('write')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  editorMode === 'write' ? 'bg-[#e2a4a4] text-[#130d11]' : 'text-white/70 hover:text-white'
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setEditorMode('preview')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  editorMode === 'preview' ? 'bg-[#e2a4a4] text-[#130d11]' : 'text-white/70 hover:text-white'
                }`}
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => setEditorMode('split')}
                className={`hidden md:block rounded-full px-3 py-1 text-xs font-medium transition ${
                  editorMode === 'split' ? 'bg-[#e2a4a4] text-[#130d11]' : 'text-white/70 hover:text-white'
                }`}
              >
                Split View
              </button>
            </div>
          </div>

          {/* Quick Insert Toolbar */}
          {(editorMode === 'write' || editorMode === 'split') && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 text-xs">
              <span className="text-white/40 px-1 font-medium">Quick Insert:</span>
              <button
                type="button"
                onClick={() => insertMarkdownSyntax('## ')}
                className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 text-white hover:border-[#e2a4a4]"
              >
                + Heading
              </button>
              <button
                type="button"
                onClick={() => insertMarkdownSyntax('**', '**')}
                className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 text-white hover:border-[#e2a4a4]"
              >
                **Bold**
              </button>
              <button
                type="button"
                onClick={() => insertMarkdownSyntax('*', '*')}
                className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 text-white hover:border-[#e2a4a4]"
              >
                *Italic*
              </button>
              <button
                type="button"
                onClick={() => insertMarkdownSyntax('> ')}
                className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 text-white hover:border-[#e2a4a4]"
              >
                &gt; Quote
              </button>
              <button
                type="button"
                onClick={() => insertMarkdownSyntax('- ')}
                className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 text-white hover:border-[#e2a4a4]"
              >
                • Bullet List
              </button>
            </div>
          )}

          {/* Editor & Preview Area */}
          <div
            className={`grid gap-6 ${
              editorMode === 'split' ? 'md:grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {/* Markdown Textarea */}
            {(editorMode === 'write' || editorMode === 'split') && (
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                  Markdown Editor <span className="text-rose-400">*</span>
                </label>
                <textarea
                  id="blog-markdown-textarea"
                  rows={16}
                  value={formData.markdownContent}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, markdownContent: e.target.value }));
                    if (errors.markdownContent)
                      setErrors((prev) => ({ ...prev, markdownContent: null }));
                  }}
                  placeholder="Write article content using Markdown format...&#10;&#10;## Section Title&#10;Write your paragraph here..."
                  className={`w-full font-mono text-sm leading-relaxed rounded-2xl border bg-black/60 p-4 text-white placeholder-white/30 focus:outline-none ${
                    errors.markdownContent
                      ? 'border-rose-500'
                      : 'border-white/10 focus:border-[#e2a4a4]'
                  }`}
                />
                {errors.markdownContent && (
                  <p className="mt-1 text-xs text-rose-400">{errors.markdownContent}</p>
                )}
              </div>
            )}

            {/* Live Preview Display */}
            {(editorMode === 'preview' || editorMode === 'split') && (
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                  Live Site Preview
                </label>
                <div className="h-[420px] overflow-y-auto rounded-2xl border border-rose/20 bg-white p-6 text-espresso shadow-soft">
                  <header className="border-b border-rose/10 pb-4 mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d68b8b]">
                      {categories.find((c) => c.id === formData.category_id)?.name || 'Category'}
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-[#2d2424]">
                      {formData.title || 'Untitled Article'}
                    </h1>
                    <div className="mt-2 text-xs text-espresso/60">
                      By {formData.author || 'Lavs Studio'} • {formData.published_at.slice(0, 10)}
                    </div>
                  </header>

                  <div className="space-y-4 text-sm text-espresso/80 leading-relaxed">
                    {previewBlocks.length === 0 ? (
                      <p className="text-espresso/40 italic">Start typing content to see live preview...</p>
                    ) : (
                      previewBlocks.map((block, idx) => {
                        if (block.type === 'heading') {
                          return (
                            <h2 key={idx} className="mt-4 text-xl font-bold text-[#2d2424]">
                              {block.text}
                            </h2>
                          );
                        }
                        if (block.type === 'quote') {
                          return (
                            <blockquote
                              key={idx}
                              className="my-3 border-l-4 border-[#d68b8b] bg-[#fcf8f6] p-3 italic text-espresso/90 rounded-r-xl"
                            >
                              "{block.text}"
                            </blockquote>
                          );
                        }
                        if (block.type === 'list') {
                          return (
                            <li key={idx} className="ml-4 list-disc text-espresso/85">
                              {block.text}
                            </li>
                          );
                        }
                        return <p key={idx}>{block.text}</p>;
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: SEO Settings */}
        <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 space-y-5">
          <h3 className="text-lg font-semibold text-[#e2a4a4]">4. Search Engine Optimization (SEO)</h3>

          <div className="grid gap-5 md:grid-cols-2">
            {/* SEO Title */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                SEO Title
              </label>
              <input
                type="text"
                value={formData.seo_title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, seo_title: e.target.value }))
                }
                placeholder="Title tag displayed in Google Search..."
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#e2a4a4] focus:outline-none"
              />
            </div>

            {/* SEO Description */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                SEO Meta Description
              </label>
              <input
                type="text"
                value={formData.seo_description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, seo_description: e.target.value }))
                }
                placeholder="Meta description displayed in search snippets..."
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#e2a4a4] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Publishing & Visibility */}
        <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 space-y-5">
          <h3 className="text-lg font-semibold text-[#e2a4a4]">5. Visibility & Schedule</h3>

          <div className="grid gap-5 md:grid-cols-2 items-center">
            {/* Published Date */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                Publish Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.published_at}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, published_at: e.target.value }))
                }
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white focus:border-[#e2a4a4] focus:outline-none"
              />
            </div>

            {/* Published Checkbox Toggle */}
            <div className="pt-4">
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
                  <span className="text-sm font-semibold text-white">Publish Article Immediately</span>
                  <p className="text-xs text-white/50">
                    When enabled, article is instantly visible on the public blog storefront.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="flex items-center justify-end gap-4 border-t border-white/10 pt-6">
          <Link
            to="/admin/blog"
            className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm text-white hover:bg-white/10"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || isUploadingCover}
            className="rounded-full bg-[#e2a4a4] px-8 py-2.5 text-sm font-semibold text-[#130d11] transition hover:bg-[#efb3b3] shadow-lg shadow-[#e2a4a4]/20 disabled:opacity-50"
          >
            {isSubmitting
              ? 'Saving Article...'
              : isUploadingCover
              ? 'Uploading Cover Image...'
              : isEdit
              ? 'Save Changes'
              : 'Create Article'}
          </button>
        </div>
      </form>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => {
          setFormData((prev) => ({ ...prev, cover_image: url }));
          setCoverPreview(url);
          setCoverFile(null);
        }}
        targetFolder="blog"
      />
    </div>
  );
}
