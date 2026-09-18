import MediaPickerModal from '../components/MediaPickerModal';

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
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        setSections([]);
      } else {
        setSections(data);
      }
    } catch (err) {
      console.error('Error loading homepage sections:', err);
      showNotification('error', `Failed to load homepage sections: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  // Initialize/Seed Default Sections into Supabase if empty
  const handleSeedDefaultSections = async () => {
    setIsLoading(true);
    try {
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

      if (error) throw error;

      setSections(data || []);
      showNotification('success', 'Default homepage sections initialized in Supabase!');
    } catch (err) {
      console.error('Error initializing default sections:', err);
      showNotification('error', `Failed to initialize sections: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (section) => {
    const newActive = !section.active;
    try {
      const { error } = await supabase
        .from('homepage_sections')
        .update({ active: newActive })
        .eq('id', section.id);

      if (error) throw error;

      setSections((prev) =>
        prev.map((s) => (s.id === section.id ? { ...s, active: newActive } : s))
      );
      showNotification(
        'success',
        `Section "${section.section_title}" is now ${newActive ? 'Enabled' : 'Disabled'}.`
      );
    } catch (err) {
      console.error('Error toggling active status:', err);
      showNotification('error', `Failed to update section: ${err.message}`);
    }
  };

  // Reorder Sections (Move Up / Move Down)
  const handleMove = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const itemA = newSections[index];
    const itemB = newSections[targetIndex];

    // Swap display order numbers
    const orderA = itemA.display_order;
    const orderB = itemB.display_order;

    itemA.display_order = orderB;
    itemB.display_order = orderA;

    // Swap position in array
    newSections[index] = itemB;
    newSections[targetIndex] = itemA;

    setSections(newSections);

    // Save to Supabase
    try {
      const updates = [
        supabase
          .from('homepage_sections')
          .update({ display_order: itemA.display_order })
          .eq('id', itemA.id),
        supabase
          .from('homepage_sections')
          .update({ display_order: itemB.display_order })
          .eq('id', itemB.id),
      ];

      await Promise.all(updates);
      showNotification('success', 'Section order updated.');
    } catch (err) {
      console.error('Error saving reorder:', err);
      showNotification('error', `Failed to save order: ${err.message}`);
      fetchSections(); // Revert on failure
    }
  };

  // Open Edit Form Modal/Drawer
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

  // Handle Hero Image File Selection
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

  // Upload image to Supabase Storage
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

  // Save Section Form Updates
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
          showNotification(
            'error',
            `Hero image upload failed: ${uploadErr.message}. Make sure 'website-images' bucket exists.`
          );
          setIsSavingSection(false);
          return;
        }
      }

      // Build updated configuration_data JSON
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

      const { error } = await supabase
        .from('homepage_sections')
        .update(payload)
        .eq('id', editingSection.id);

      if (error) throw error;

      setSections((prev) =>
        prev.map((s) =>
          s.id === editingSection.id
            ? { ...s, ...payload, configuration_data: updatedConfig }
            : s
        )
      );

      showNotification('success', 'Section configuration saved to Supabase!');
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
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#e2a4a4]">
            Layout & Content
          </p>
          <h2 className="mt-1 text-3xl font-semibold">Homepage Management</h2>
          <p className="mt-1 text-sm text-white/60">
            Customize hero banners, section order, visibility, titles, and layout without changing code.
          </p>
        </div>

        {sections.length === 0 && !isLoading && (
          <button
            onClick={handleSeedDefaultSections}
            className="rounded-full bg-[#e2a4a4] px-5 py-2.5 text-sm font-semibold text-[#130d11] transition hover:bg-[#efb3b3] shadow-lg shadow-[#e2a4a4]/20"
          >
            + Initialize Default Sections
          </button>
        )}
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-12 text-center text-white/60 animate-pulse">
          Loading homepage section layout...
        </div>
      ) : sections.length === 0 ? (
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-lg font-medium text-white/80">No homepage sections found</p>
          <p className="mt-2 text-sm text-white/50 max-w-md mx-auto">
            Click below to load the default homepage sections into your Supabase database. You can then edit, reorder, or toggle any section!
          </p>
          <button
            onClick={handleSeedDefaultSections}
            className="mt-6 rounded-full bg-[#e2a4a4] px-6 py-2.5 text-sm font-semibold text-[#130d11] transition hover:bg-[#efb3b3]"
          >
            Initialize Default Homepage Sections
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-white/50 px-1">
            Use the <strong className="text-white">Up / Down</strong> buttons to reorder sections on the live website. Use the <strong className="text-white">Enable/Disable</strong> switch to show or hide a section.
          </p>

          <div className="space-y-3">
            {sections.map((section, idx) => (
              <div
                key={section.id}
                className={`flex flex-col gap-4 rounded-[24px] border p-5 transition sm:flex-row sm:items-center sm:justify-between ${
                  section.active
                    ? 'border-white/15 bg-white/5'
                    : 'border-white/5 bg-black/40 opacity-60'
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
                      className="rounded-md border border-white/10 p-1 text-xs text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      ▲
                    </button>
                    <span className="text-xs font-mono font-semibold text-[#e2a4a4]">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      disabled={idx === sections.length - 1}
                      onClick={() => handleMove(idx, 'down')}
                      title="Move Down"
                      className="rounded-md border border-white/10 p-1 text-xs text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      ▼
                    </button>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#e2a4a4]/20 border border-[#e2a4a4]/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#e2a4a4]">
                        {section.section_type}
                      </span>
                      <h4 className="truncate text-base font-semibold text-white">
                        {section.section_title}
                      </h4>
                    </div>
                    {section.subtitle && (
                      <p className="mt-1 truncate text-xs text-white/60">
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
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      section.active
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/10 text-white/50 border border-white/10'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        section.active ? 'bg-emerald-400' : 'bg-white/30'
                      }`}
                    />
                    {section.active ? 'Enabled' : 'Disabled'}
                  </button>

                  {/* Edit Config Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(section)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white transition hover:border-[#e2a4a4] hover:bg-[#e2a4a4]/10 hover:text-[#e2a4a4]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-[32px] border border-white/15 bg-[#181116] p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="rounded-full bg-[#e2a4a4]/20 border border-[#e2a4a4]/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#e2a4a4]">
                  {editingSection.section_type}
                </span>
                <h3 className="mt-1 text-xl font-semibold text-white">
                  Edit Section Settings
                </h3>
              </div>
              <button
                onClick={() => setEditingSection(null)}
                className="text-white/50 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-5">
              {/* Common Fields: Title & Subtitle */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                  Section Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.section_title}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, section_title: e.target.value }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white focus:border-[#e2a4a4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                  Eyebrow / Subtitle
                </label>
                <input
                  type="text"
                  value={editFormData.subtitle}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, subtitle: e.target.value }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white focus:border-[#e2a4a4] focus:outline-none"
                />
              </div>

              {/* Specific Fields for HERO Section */}
              {editingSection.section_type === 'hero' && (
                <>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                      Hero Description Paragraph
                    </label>
                    <textarea
                      rows={3}
                      value={editFormData.description}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white focus:border-[#e2a4a4] focus:outline-none"
                    />
                  </div>

                  {/* Hero Image */}
                  <div className="grid gap-4 md:grid-cols-[1fr_120px] items-center">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium uppercase tracking-wider text-white/70">
                          Hero Image
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsMediaPickerOpen(true)}
                          className="text-[11px] font-semibold text-[#e2a4a4] hover:underline"
                        >
                          📷 Pick from Library
                        </button>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeroFileSelect}
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white file:mr-3 file:rounded-lg file:border-0 file:bg-[#e2a4a4] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#130d11]"
                      />
                      <input
                        type="text"
                        placeholder="Or paste external image URL..."
                        value={editFormData.hero_image}
                        onChange={(e) => {
                          setEditFormData((prev) => ({ ...prev, hero_image: e.target.value }));
                          setHeroImagePreview(e.target.value);
                        }}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-xs text-white focus:border-[#e2a4a4] focus:outline-none"
                      />
                    </div>

                    <div className="h-24 w-24 overflow-hidden rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                      {heroImagePreview ? (
                        <img
                          src={heroImagePreview}
                          alt="Hero Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-white/30">No Image</span>
                      )}
                    </div>
                  </div>

                  {/* Button 1 & Button 2 */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                        Primary Button Text
                      </label>
                      <input
                        type="text"
                        value={editFormData.btn_primary_text}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, btn_primary_text: e.target.value }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white focus:border-[#e2a4a4] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                        Primary Button URL
                      </label>
                      <input
                        type="text"
                        value={editFormData.btn_primary_url}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, btn_primary_url: e.target.value }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white focus:border-[#e2a4a4] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                        Secondary Button Text
                      </label>
                      <input
                        type="text"
                        value={editFormData.btn_secondary_text}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, btn_secondary_text: e.target.value }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white focus:border-[#e2a4a4] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                        Secondary Button URL
                      </label>
                      <input
                        type="text"
                        value={editFormData.btn_secondary_url}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, btn_secondary_url: e.target.value }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white focus:border-[#e2a4a4] focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Count Limit for Featured Products or Blog */}
              {(editingSection.section_type === 'featured_products' ||
                editingSection.section_type === 'blog') && (
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
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
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white focus:border-[#e2a4a4] focus:outline-none"
                  />
                </div>
              )}

              {/* Specific fields for NEWSLETTER section */}
              {editingSection.section_type === 'newsletter' && (
                <>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                      Description Paragraph
                    </label>
                    <textarea
                      rows={2}
                      value={editFormData.description}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white focus:border-[#e2a4a4] focus:outline-none"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                        Button Label
                      </label>
                      <input
                        type="text"
                        value={editFormData.button_text}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, button_text: e.target.value }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white focus:border-[#e2a4a4] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                        Input Placeholder
                      </label>
                      <input
                        type="text"
                        value={editFormData.placeholder}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, placeholder: e.target.value }))
                        }
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white focus:border-[#e2a4a4] focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSection || isUploadingImage}
                  className="rounded-full bg-[#e2a4a4] px-6 py-2 text-sm font-semibold text-[#130d11] transition hover:bg-[#efb3b3] disabled:opacity-50"
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
