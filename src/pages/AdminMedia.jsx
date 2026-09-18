import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export default function AdminMedia() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [folderFilter, setFolderFilter] = useState('all');

  // Preview Modal state
  const [previewTarget, setPreviewTarget] = useState(null);

  // Delete Target state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Upload Form state
  const [uploadFolder, setUploadFolder] = useState('general');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Toast Notification
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch Media Files from Supabase Storage
  const fetchAllMediaFiles = async () => {
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

      setFiles(allFiles);
    } catch (err) {
      console.error('Error listing storage files:', err);
      showNotification('error', `Failed to load media files: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMediaFiles();
  }, []);

  // File Select & Validation (JPG, JPEG, PNG, WEBP, Max 5MB)
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    setValidationError(null);

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      setValidationError('Invalid file format. Only JPG, JPEG, PNG, and WEBP formats are accepted.');
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setValidationError(
        `File size exceeds 5MB limit. Selected file size: ${(file.size / (1024 * 1024)).toFixed(
          2
        )} MB`
      );
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  // Upload to Supabase Storage
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setValidationError('Please select an image file to upload.');
      return;
    }

    setIsUploading(true);
    setValidationError(null);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const folder = uploadFolder || 'general';
      const fileName = `${folder}/${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 7)}.${fileExt}`;

      const { error } = await supabase.storage
        .from('website-images')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;

      showNotification('success', `Image "${selectedFile.name}" uploaded to Supabase Storage!`);
      setSelectedFile(null);
      setFilePreview(null);
      fetchAllMediaFiles();
    } catch (err) {
      console.error('Error uploading file:', err);
      setValidationError(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Copy Image URL to Clipboard
  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    showNotification('success', 'Image URL copied to clipboard!');
  };

  // Execute File Deletion from Supabase Storage
  const handleDeleteExecute = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.storage
        .from('website-images')
        .remove([deleteTarget.fullPath]);

      if (error) throw error;

      setFiles((prev) => prev.filter((f) => f.fullPath !== deleteTarget.fullPath));
      showNotification('success', `File "${deleteTarget.name}" deleted from storage.`);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting file:', err);
      showNotification('error', `Failed to delete file: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered files
  const filteredFiles = files.filter((f) => {
    const matchesSearch =
      !searchTerm ||
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.folder.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFolder =
      folderFilter === 'all' || f.folder.toLowerCase() === folderFilter.toLowerCase();

    return matchesSearch && matchesFolder;
  });

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
            Assets & Media
          </p>
          <h2 className="mt-1 text-3xl font-semibold">Media Library</h2>
          <p className="mt-1 text-sm text-white/60">
            Upload, preview, copy URLs, search, and manage your website images in Supabase Storage.
          </p>
        </div>
      </div>

      {/* Section 1: Upload Box */}
      <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-[#e2a4a4]">Upload Image Asset</h3>

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_200px]">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                Target Folder
              </label>
              <select
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-sm text-white focus:border-[#e2a4a4] focus:outline-none"
              >
                <option value="general" className="bg-[#130d11]">General Assets</option>
                <option value="products" className="bg-[#130d11]">Products</option>
                <option value="blog" className="bg-[#130d11]">Blog Posts</option>
                <option value="categories" className="bg-[#130d11]">Categories</option>
                <option value="homepage" className="bg-[#130d11]">Homepage Banners</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={!selectedFile || isUploading}
                className="w-full rounded-xl bg-[#e2a4a4] py-2 text-sm font-semibold text-[#130d11] transition hover:bg-[#efb3b3] disabled:opacity-40"
              >
                {isUploading ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
          </div>

          {/* File Input Box */}
          <div className="relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-4 text-center transition hover:border-[#e2a4a4] hover:bg-white/10">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <p className="text-sm font-semibold text-white">
              {selectedFile ? `Selected: ${selectedFile.name}` : 'Click or Drag & Drop image file to upload'}
            </p>
            <p className="mt-1 text-xs text-white/50">
              Accepted formats: <strong className="text-white">JPG, JPEG, PNG, WEBP</strong> (Max file size: 5MB)
            </p>
          </div>

          {/* Validation Warning */}
          {validationError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/60 p-3 text-xs text-rose-300">
              ⚠️ {validationError}
            </div>
          )}

          {/* Preview banner if file selected */}
          {filePreview && (
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="h-16 w-16 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                <img src={filePreview} alt="Selected preview" className="h-full w-full object-cover" />
              </div>
              <div className="text-xs text-white/80">
                <p className="font-semibold text-white">{selectedFile?.name}</p>
                <p className="text-white/50">
                  Size: {((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB • Format: {selectedFile?.type}
                </p>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Section 2: Toolbar (Search & Folder Filters) */}
      <div className="grid gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-white/60 mb-1.5">
            Search Files
          </label>
          <input
            type="text"
            placeholder="Search by filename or folder..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-sm text-white placeholder-white/40 focus:border-[#e2a4a4] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-white/60 mb-1.5">
            Folder Filter
          </label>
          <select
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-sm text-white focus:border-[#e2a4a4] focus:outline-none"
          >
            <option value="all" className="bg-[#130d11]">All Folders</option>
            <option value="products" className="bg-[#130d11]">Products</option>
            <option value="blog" className="bg-[#130d11]">Blog Posts</option>
            <option value="categories" className="bg-[#130d11]">Categories</option>
            <option value="homepage" className="bg-[#130d11]">Homepage</option>
            <option value="general" className="bg-[#130d11]">General</option>
          </select>
        </div>
      </div>

      {/* Media Count Summary */}
      <div className="flex items-center justify-between text-xs text-white/60 px-1">
        <p>
          Showing <span className="font-semibold text-white">{filteredFiles.length}</span> of{' '}
          <span className="font-semibold text-white">{files.length}</span> images in Supabase Storage
        </p>
        <button
          onClick={fetchAllMediaFiles}
          className="text-[#e2a4a4] hover:underline flex items-center gap-1"
        >
          <span>🔄</span> Refresh Library
        </button>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-12 text-center text-white/60 animate-pulse">
          Loading Media Library from Supabase Storage...
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-lg font-medium text-white/80">No images found</p>
          <p className="mt-1 text-sm text-white/50">
            {files.length === 0
              ? 'Upload your first image using the box above!'
              : 'Try clearing your search query or folder filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="group relative flex flex-col overflow-hidden rounded-[20px] border border-white/10 bg-black/20 shadow-lg transition hover:border-[#e2a4a4]"
            >
              {/* Image Preview Box */}
              <div
                onClick={() => setPreviewTarget(file)}
                className="aspect-square w-full cursor-pointer overflow-hidden bg-black/40"
              >
                <img
                  src={file.publicUrl}
                  alt={file.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/200?text=Invalid+Image';
                  }}
                />
              </div>

              {/* File Info */}
              <div className="p-3 flex-1 flex flex-col justify-between text-xs space-y-2">
                <div>
                  <p className="truncate font-semibold text-white" title={file.name}>
                    {file.name}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-white/50">
                    <span className="uppercase text-[#e2a4a4] font-semibold">{file.folder}</span> •{' '}
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                  <p className="text-[10px] text-white/40 mt-0.5">
                    {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions: Copy URL & Delete */}
                <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(file.publicUrl)}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-medium text-white transition hover:border-[#e2a4a4] hover:bg-[#e2a4a4]/10 hover:text-[#e2a4a4]"
                  >
                    Copy URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(file)}
                    className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-2 py-1 text-[11px] text-rose-300 transition hover:bg-rose-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enlarged Image Preview Modal */}
      {previewTarget && (
        <div
          onClick={() => setPreviewTarget(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-[32px] border border-white/15 bg-[#181116] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#e2a4a4]">
                  {previewTarget.folder}
                </p>
                <h3 className="text-lg font-semibold text-white">{previewTarget.name}</h3>
              </div>
              <button
                onClick={() => setPreviewTarget(null)}
                className="text-white/50 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[450px] overflow-hidden rounded-2xl border border-white/10 bg-black/50 flex items-center justify-center">
              <img
                src={previewTarget.publicUrl}
                alt={previewTarget.name}
                className="max-h-[450px] w-auto object-contain"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-white/60">
              <div>
                <p>Path: <code className="text-white font-mono">{previewTarget.fullPath}</code></p>
                <p>Size: {((previewTarget.size || 0) / 1024).toFixed(1)} KB • Uploaded: {new Date(previewTarget.created_at).toLocaleString()}</p>
              </div>

              <button
                onClick={() => handleCopyUrl(previewTarget.publicUrl)}
                className="rounded-full bg-[#e2a4a4] px-5 py-2 text-xs font-semibold text-[#130d11]"
              >
                Copy Public URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[28px] border border-white/15 bg-[#181116] p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-white">Delete Image</h3>
            <p className="mt-2 text-sm text-white/70">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-white">"{deleteTarget.name}"</span> from Supabase Storage?
              This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteExecute}
                disabled={isDeleting}
                className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Image'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
