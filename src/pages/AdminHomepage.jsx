import { useEffect, useState } from 'react';
import MediaPickerModal from '../components/MediaPickerModal';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEFAULT_HOMEPAGE_SECTIONS, saveLocalHomepageSections } from '../lib/content';

export default function AdminHomepage() {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Section Drawer/Modal state
  const [editingSection, setEditingSection] = useState(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSavingSection, setIsSavingSection] = useState(false);

  // Image Upload state for Hero
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [heroImagePreview, setHeroImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Notification Toast
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchSections = async () => {
    setIsLoading(true);
    try {
      if (!supabase || !isSupabaseConfigured) {
        const raw = localStorage.getItem('lavsstudio_custom_homepage_sections');
        const parsed = raw ? JSON.parse(raw) : null;
        setSections(parsed || DEFAULT_HOMEPAGE_SECTIONS);
        return;
      }

      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        const raw = localStorage.getItem('lavsstudio_custom_homepage_sections');
        const parsed = raw ? JSON.parse(raw) : null;
        setSections(parsed || DEFAULT_HOMEPAGE_SECTIONS);
      } else {
        setSections(data);
      }
    } catch (err) {
      console.error('Error loading homepage sections:', err);
      const raw = localStorage.getItem('lavsstudio_custom_homepage_sections');
      const parsed = raw ? JSON.parse(raw) : null;
      setSections(parsed || DEFAULT_HOMEPAGE_SECTIONS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleSeedDefaultSections = async () => {
    setIsLoading(true);
    try {
      if (supabase && isSupabaseConfigured) {
        const rowsToInsert = DEFAULT_HOMEPAGE_SECTIONS.map((sec) => ({
          section_title: sec.section_title,
          subtitle: sec.subtitle,
          section_type: sec.section_type,
          display_order: sec.display_order,
          active: sec.active,
          configuration_data: sec.configuration_data,
        }));

        const { data, error } = await supabase
          .from('homepage_sections')
          .insert(rowsToInsert)
          .select('*');

        if (!error && data) {
          setSections(data);
          saveLocalHomepageSections(data);
          showNotification('success', 'Default homepage sections initialized in Supabase!');
          return;
        }
      }

      setSections(DEFAULT_HOMEPAGE_SECTIONS);
      saveLocalHomepageSections(DEFAULT_HOMEPAGE_SECTIONS);
      showNotification('success', 'Homepage sections reset to default!');
    } catch (err) {
      console.error('Error initializing default sections:', err);
      setSections(DEFAULT_HOMEPAGE_SECTIONS);
      saveLocalHomepageSections(DEFAULT_HOMEPAGE_SECTIONS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (section) => {
    const newActive = !section.active;
    const updated = sections.map((s) => (s.id === section.id ? { ...s, active: newActive } : s));
    setSections(updated);
    saveLocalHomepageSections(updated);

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('homepage_sections')
          .update({ active: newActive })
          .eq('id', section.id);
      } catch (err) {
        console.warn('Supabase toggle section active error:', err);
      }
    }

    showNotification(
      'success',
      `Section "${section.section_title}" is now ${newActive ? 'Enabled' : 'Disabled'}.`
    );
  };

  const handleMove = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const itemA = newSections[index];
    const itemB = newSections[targetIndex];

    const orderA = itemA.display_order;
    const orderB = itemB.display_order;

    itemA.display_order = orderB;
    itemB.display_order = orderA;

    newSections[index] = itemB;
    newSections[targetIndex] = itemA;

    setSections(newSections);
    saveLocalHomepageSections(newSections);

    if (supabase && isSupabaseConfigured) {
      try {
        await Promise.all([
          supabase
            .from('homepage_sections')
            .update({ display_order: itemA.display_order })
            .eq('id', itemA.id),
          supabase
            .from('homepage_sections')
            .update({ display_order: itemB.display_order })
            .eq('id', itemB.id),
        ]);
      } catch (err) {
        console.warn('Supabase reorder sections error:', err);
      }
    }

    showNotification('success', 'Section order updated.');
  };

  const handleOpenEdit = (section) => {
    setEditingSection(section);
    setEditFormData({
      section_title: section.section_title || '',
      subtitle: section.subtitle || '',
      description: section.configuration_data?.description || '',
      hero_image: section.configuration_data?.hero_image || '',
      btn_primary_text: section.configuration_data?.btn_primary_text || '',
      btn_primary_url: section.configuration_data?.btn_primary_url || '',
      btn_secondary_text: section.configuration_data?.btn_secondary_text || '',
      btn_secondary_url: section.configuration_data?.btn_secondary_url || '',
      limit: section.configuration_data?.limit || 3,
      button_text: section.configuration_data?.button_text || '',
      placeholder: section.configuration_data?.placeholder || '',
    });
    setHeroImageFile(null);
    setHeroImagePreview(section.configuration_data?.hero_image || null);
  };

  const handleHeroFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotification('error', 'Please select a valid image file.');
        return;
      }
      setHeroImageFile(file);
      setHeroImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadHeroImage = async (file) => {
    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `homepage/${Date.now()}_${Math.random()
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

  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!editingSection) return;

    setIsSavingSection(true);
    try {
      let finalHeroImage = editFormData.hero_image;

      if (heroImageFile) {
        try {
          finalHeroImage = await uploadHeroImage(heroImageFile);
        } catch (uploadErr) {
          console.warn('Hero image upload failed, using preview/existing:', uploadErr);
          if (heroImagePreview) finalHeroImage = heroImagePreview;
        }
      }

      const updatedConfig = {
        ...editingSection.configuration_data,
        description: editFormData.description || undefined,
        hero_image: finalHeroImage || undefined,
        btn_primary_text: editFormData.btn_primary_text || undefined,
        btn_primary_url: editFormData.btn_primary_url || undefined,
        btn_secondary_text: editFormData.btn_secondary_text || undefined,
        btn_secondary_url: editFormData.btn_secondary_url || undefined,
        limit: editFormData.limit ? parseInt(editFormData.limit, 10) : undefined,
        button_text: editFormData.button_text || undefined,
        placeholder: editFormData.placeholder || undefined,
      };

      const payload = {
        section_title: editFormData.section_title.trim(),
        subtitle: editFormData.subtitle.trim() || null,
        configuration_data: updatedConfig,
      };

      const updatedSections = sections.map((s) =>
        s.id === editingSection.id
          ? { ...s, ...payload, configuration_data: updatedConfig }
          : s
      );

      setSections(updatedSections);
      saveLocalHomepageSections(updatedSections);

      if (supabase && isSupabaseConfigured) {
        try {
          await supabase
            .from('homepage_sections')
            .update(payload)
            .eq('id', editingSection.id);
        } catch (dbErr) {
          console.warn('Supabase section update error:', dbErr);
        }
      }

      showNotification('success', 'Homepage section saved and updated live!');
      setEditingSection(null);
    } catch (err) {
      console.error('Error saving section:', err);
      showNotification('error', `Failed to save section: ${err.message}`);
    } finally {
      setIsSavingSection(false);
    }
  };

  return (
    <div className="space-y-6">
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

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[#e9d5ff]/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#ec4899]">
            Layout & Content
          </p>
          <h2 className="mt-1 text-3xl font-bold text-[#2e1f3b]">Homepage Management</h2>
          <p className="mt-1 text-sm font-medium text-[#2e1f3b]/70">
            Customize hero banners, section order, visibility, titles, and layout without changing code.
          </p>
        </div>

        {sections.length === 0 && !isLoading && (
          <button
            onClick={handleSeedDefaultSections}
            className="rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-95"
          >
            + Initialize Default Sections
          </button>
        )}
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="rounded-[28px] border border-[#e9d5ff] bg-white/70 p-12 text-center text-[#2e1f3b]/70 animate-pulse">
          Loading homepage section layout...
        </div>
      ) : sections.length === 0 ? (
        <div className="rounded-[28px] border border-[#e9d5ff] bg-white/80 p-12 text-center shadow-sm">
          <p className="text-lg font-bold text-[#2e1f3b]">No homepage sections found</p>
          <p className="mt-2 text-sm text-[#2e1f3b]/70 max-w-md mx-auto">
            Click below to load the default homepage sections into your database. You can then edit, reorder, or toggle any section!
          </p>
          <button
            onClick={handleSeedDefaultSections}
            className="mt-6 rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-95"
          >
            Initialize Default Homepage Sections
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs font-medium text-[#2e1f3b]/70 px-1">
            Use the <strong className="text-[#2e1f3b] font-bold">Up / Down</strong> buttons to reorder sections on the live website. Use the <strong className="text-[#2e1f3b] font-bold">Enable/Disable</strong> switch to show or hide a section.
          </p>

          <div className="space-y-3">
            {sections.map((section, idx) => (
              <div
                key={section.id}
                className={`flex flex-col gap-4 rounded-[24px] border p-5 transition sm:flex-row sm:items-center sm:justify-between ${
                  section.active
                    ? 'border-[#e9d5ff] bg-white shadow-sm'
                    : 'border-gray-200 bg-gray-50/80 opacity-60'
                }`}
              >
                {/* Left info */}
                <div className="flex items-start gap-4 min-w-0">
                  {/* Order Badge & Move Buttons */}
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      title="Move Up"
                      className="rounded-md border border-[#e9d5ff] bg-white p-1 text-xs text-[#2e1f3b] hover:bg-[#f3e8ff] disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      ▲
                    </button>
                    <span className="text-xs font-mono font-bold text-[#ec4899]">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      disabled={idx === sections.length - 1}
                      onClick={() => handleMove(idx, 'down')}
                      title="Move Down"
                      className="rounded-md border border-[#e9d5ff] bg-white p-1 text-xs text-[#2e1f3b] hover:bg-[#f3e8ff] disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      ▼
                    </button>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#fde8f3] border border-[#f472b6]/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#ec4899]">
                        {section.section_type}
                      </span>
                      <h4 className="truncate text-base font-bold text-[#2e1f3b]">
                        {section.section_title}
                      </h4>
                    </div>
                    {section.subtitle && (
                      <p className="mt-1 truncate text-xs font-medium text-[#2e1f3b]/70">
                        Subtitle: {section.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  {/* Active Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(section)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      section.active
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-gray-100 text-gray-600 border border-gray-300'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        section.active ? 'bg-emerald-500' : 'bg-gray-400'
                      }`}
                    />
                    {section.active ? 'Enabled' : 'Disabled'}
                  </button>

                  {/* Edit Config Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(section)}
                    className="rounded-xl border border-[#f472b6]/40 bg-[#fde8f3] px-4 py-1.5 text-xs font-bold text-[#2e1f3b] transition hover:bg-[#f472b6] hover:text-white"
                  >
                    Edit Section
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-[32px] border border-[#e9d5ff] bg-white p-6 shadow-2xl space-y-6 text-[#2e1f3b]">
            <div className="flex items-center justify-between border-b border-[#e9d5ff] pb-4">
              <div>
                <span className="rounded-full bg-[#fde8f3] border border-[#f472b6]/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#ec4899]">
                  {editingSection.section_type}
                </span>
                <h3 className="mt-1 text-xl font-bold text-[#2e1f3b]">
                  Edit Section Settings
                </h3>
              </div>
              <button
                onClick={() => setEditingSection(null)}
                className="text-[#2e1f3b]/60 hover:text-[#2e1f3b] text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-5">
              {/* Common Fields: Title & Subtitle */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
                  Section Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.section_title}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, section_title: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2.5 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
                  Eyebrow / Subtitle
                </label>
                <input
                  type="text"
                  value={editFormData.subtitle}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, subtitle: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2.5 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
                />
              </div>

              {/* Specific Fields for HERO Section */}
              {editingSection.section_type === 'hero' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
                      Hero Description Paragraph
                    </label>
                    <textarea
                      rows={3}
                      value={editFormData.description}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2.5 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
                    />
                  </div>

                  {/* Hero Image */}
                  <div className="grid gap-4 md:grid-cols-[1fr_120px] items-center">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b]">
                          Hero Image
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
                        onChange={handleHeroFileSelect}
                        className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-3 py-2 text-xs font-semibold text-[#2e1f3b] file:mr-3 file:rounded-lg file:border-0 file:bg-[#fde8f3] file:px-3 file:py-1 file:text-xs file:font-bold file:text-[#ec4899]"
                      />
                      <input
                        type="text"
                        placeholder="Or paste external image URL..."
                        value={editFormData.hero_image}
                        onChange={(e) => {
                          setEditFormData((prev) => ({ ...prev, hero_image: e.target.value }));
                          setHeroImagePreview(e.target.value);
                        }}
                        className="mt-2 w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2 text-xs font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
                      />
                    </div>

                    <div className="h-24 w-24 overflow-hidden rounded-xl border border-[#e9d5ff] bg-[#fde8f3]/30 flex items-center justify-center">
                      {heroImagePreview ? (
                        <img
                          src={heroImagePreview}
                          alt="Hero Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-[#2e1f3b]/40 font-bold">No Image</span>
                      )}
                    </div>
                  </div>

                  {/* Button 1 & Button 2 */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
                        Primary Button Text
                      </label>
                      <input
                        type="text"
                        value={editFormData.btn_primary_text}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, btn_primary_text: e.target.value }))
                        }
                        className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
                        Primary Button URL
                      </label>
                      <input
                        type="text"
                        value={editFormData.btn_primary_url}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, btn_primary_url: e.target.value }))
                        }
                        className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
                        Secondary Button Text
                      </label>
                      <input
                        type="text"
                        value={editFormData.btn_secondary_text}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, btn_secondary_text: e.target.value }))
                        }
                        className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
                        Secondary Button URL
                      </label>
                      <input
                        type="text"
                        value={editFormData.btn_secondary_url}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, btn_secondary_url: e.target.value }))
                        }
                        className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Count Limit for Featured Products or Blog */}
              {(editingSection.section_type === 'featured_products' ||
                editingSection.section_type === 'blog') && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
                    Items to Display
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={editFormData.limit}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, limit: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2.5 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
                  />
                </div>
              )}

              {/* Specific fields for NEWSLETTER section */}
              {editingSection.section_type === 'newsletter' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
                      Description Paragraph
                    </label>
                    <textarea
                      rows={2}
                      value={editFormData.description}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2.5 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
                        Button Label
                      </label>
                      <input
                        type="text"
                        value={editFormData.button_text}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, button_text: e.target.value }))
                        }
                        className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
                        Input Placeholder
                      </label>
                      <input
                        type="text"
                        value={editFormData.placeholder}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, placeholder: e.target.value }))
                        }
                        className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-4 py-2 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-[#e9d5ff] pt-4">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="rounded-full border border-[#e9d5ff] bg-white px-5 py-2 text-sm font-bold text-[#2e1f3b] hover:bg-[#fde8f3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSection || isUploadingImage}
                  className="rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-6 py-2 text-sm font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50"
                >
                  {isSavingSection
                    ? 'Saving...'
                    : isUploadingImage
                    ? 'Uploading Image...'
                    : 'Save Section Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => {
          setEditFormData((prev) => ({ ...prev, hero_image: url }));
          setHeroImagePreview(url);
          setHeroImageFile(null);
        }}
        targetFolder="homepage"
      />
    </div>
  );
}
