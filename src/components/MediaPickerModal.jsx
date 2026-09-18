import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  targetFolder = 'general',
}) {
  const [tab, setTab] = useState('library'); // 'library' | 'upload'
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  // Upload Tab state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Notification Toast
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch all media files from Supabase Storage
  const fetchMediaFiles = async () => {
    setIsLoading(true);
    try {
      const folders = ['', 'products', 'blog', 'categories', 'homepage', 'general'];
      let allFiles = [];

      for (const folder of folders) {
        const { data, error } = await supabase.storage
          .from('website-images')
          .list(folder, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

        if (!error && Array.isArray(data)) {
          data.forEach((file) => {
            // Filter out placeholder directories
            if (file.name && file.name !== '.emptyFolderPlaceholder') {
              const fullPath = folder ? `${folder}/${file.name}` : file.name;
              const { data: publicUrlData } = supabase.storage
                .from('website-images')
                .getPublicUrl(fullPath);

              allFiles.push({
                id: file.id || fullPath,
                name: file.name,
                fullPath: fullPath,
                folder: folder || 'root',
                size: file.metadata?.size || file.size || 0,
                created_at: file.created_at || file.updated_at || new Date().toISOString(),
                publicUrl: publicUrlData.publicUrl,
              });
            }
          });
        }
      }

      setMediaFiles(allFiles);
    } catch (err) {
      console.error('Error fetching media files:', err);
      showNotification('error', `Failed to load media files: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMediaFiles();
      setSelectedImage(null);
      setValidationError(null);
    }
  }, [isOpen]);

  // Handle File Selection with Type & Size Validation
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    setValidationError(null);

    if (!file) return;

    // Validate File Type (JPG, JPEG, PNG, WEBP)
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      setValidationError('Invalid file format. Please upload JPG, JPEG, PNG, or WEBP images.');
      setUploadFile(null);
      setUploadPreview(null);
      return;
    }

    // Validate File Size (Max 5 MB)
    if (file.size > MAX_SIZE_BYTES) {
      setValidationError(
        `File size exceeds 5MB limit. (Selected file: ${(file.size / (1024 * 1024)).toFixed(
          2
        )} MB)`
      );
      setUploadFile(null);
      setUploadPreview(null);
      return;
    }

    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
  };

  // Upload file to Supabase Storage
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setValidationError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setValidationError(null);

    try {
      const fileExt = uploadFile.name.split('.').pop();
      const cleanFolder = targetFolder || 'general';
      const fileName = `${cleanFolder}/${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('website-images')
        .upload(fileName, uploadFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('website-images')
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;
      showNotification('success', 'Image uploaded successfully!');
      
      onSelect(publicUrl);
      onClose();
    } catch (err) {
      console.error('Error uploading image:', err);
      setValidationError(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  const filteredFiles = mediaFiles.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.folder.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
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

      <div className="my-8 w-full max-w-4xl rounded-[32px] border border-white/15 bg-[#181116] p-6 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-xl font-semibold text-white">Select Image</h3>
            <p className="text-xs text-white/50">
              Pick an existing image from Supabase Storage or upload a new file.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Tabs */}
            <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setTab('library')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  tab === 'library'
                    ? 'bg-[#e2a4a4] text-[#130d11]'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Media Library
              </button>
              <button
                type="button"
                onClick={() => setTab('upload')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  tab === 'upload'
                    ? 'bg-[#e2a4a4] text-[#130d11]'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Upload File
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-white/50 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab 1: Media Library */}
        {tab === 'library' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center justify-between gap-4">
              <input
                type="text"
                placeholder="Search images by name or folder..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-md rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder-white/40 focus:border-[#e2a4a4] focus:outline-none"
              />
              <button
                type="button"
                onClick={fetchMediaFiles}
                className="text-xs text-[#e2a4a4] hover:underline"
              >
                🔄 Refresh
              </button>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="h-64 flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/50 animate-pulse">
                Loading media library...
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-center p-6">
                <p className="text-white/80 font-medium">No images found</p>
                <p className="mt-1 text-xs text-white/40">
                  Switch to the "Upload File" tab to add your first image to Supabase Storage.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 max-h-[380px] overflow-y-auto p-1">
                {filteredFiles.map((file) => {
                  const isSelected = selectedImage?.publicUrl === file.publicUrl;
                  return (
                    <div
                      key={file.id}
                      onClick={() => setSelectedImage(file)}
                      className={`group relative cursor-pointer overflow-hidden rounded-2xl border transition ${
                        isSelected
                          ? 'border-[#e2a4a4] ring-2 ring-[#e2a4a4]'
                          : 'border-white/10 bg-white/5 hover:border-white/30'
                      }`}
                    >
                      <div className="aspect-square w-full overflow-hidden bg-black/40">
                        <img
                          src={file.publicUrl}
                          alt={file.name}
                          className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150?text=Error';
                          }}
                        />
                      </div>
                      <div className="p-2 text-[11px]">
                        <p className="truncate font-medium text-white">{file.name}</p>
                        <p className="truncate text-[9px] text-white/40 uppercase">
                          {file.folder} • {(file.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#e2a4a4] text-[#130d11] text-xs font-bold shadow">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer Select Action */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-xs text-white/50 truncate max-w-md">
                {selectedImage
                  ? `Selected: ${selectedImage.name}`
                  : 'Click an image above to select'}
              </span>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedImage}
                  onClick={() => {
                    if (selectedImage) {
                      onSelect(selectedImage.publicUrl);
                      onClose();
                    }
                  }}
                  className="rounded-full bg-[#e2a4a4] px-6 py-2 text-sm font-semibold text-[#130d11] transition hover:bg-[#efb3b3] disabled:opacity-40"
                >
                  Use Selected Image
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Upload File */}
        {tab === 'upload' && (
          <form onSubmit={handleUploadSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-6 text-center transition hover:border-[#e2a4a4] hover:bg-white/10">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                <p className="text-sm font-semibold text-white">
                  {uploadFile ? `Selected: ${uploadFile.name}` : 'Click or Drag & Drop image file'}
                </p>
                <p className="mt-1 text-xs text-white/50">
                  Accepted formats: <strong className="text-white">JPG, JPEG, PNG, WEBP</strong> (Max 5MB)
                </p>
              </div>

              {validationError && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-950/60 p-3 text-xs text-rose-300">
                  ⚠️ {validationError}
                </div>
              )}

              {uploadPreview && (
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                    <img src={uploadPreview} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 text-xs">
                    <p className="truncate font-semibold text-white">{uploadFile?.name}</p>
                    <p className="text-white/50 mt-0.5">
                      Size: {((uploadFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <p className="text-white/50">Type: {uploadFile?.type}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!uploadFile || isUploading}
                className="rounded-full bg-[#e2a4a4] px-6 py-2 text-sm font-semibold text-[#130d11] transition hover:bg-[#efb3b3] disabled:opacity-40"
              >
                {isUploading ? 'Uploading to Supabase...' : 'Upload & Use Image'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
