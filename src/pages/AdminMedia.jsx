import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminMedia() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [folderFilter, setFolderFilter] = useState('all');

  // Preview Modal State
  const [previewTarget, setPreviewTarget] = useState(null);

  // Deletion Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Upload Form State
  const [uploadFolder, setUploadFolder] = useState('general');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Notification Toast
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchAllMediaFiles = async () => {
    setIsLoading(true);
    try {
      if (!supabase) {
        setFiles([]);
        setIsLoading(false);
        return;
      }

      const folders = ['general', 'products', 'blog', 'categories', 'homepage'];
      let allFiles = [];

      for (const folder of folders) {
        try {
          const { data, error } = await supabase.storage
            .from('website-images')
            .list(folder, {
              limit: 100,
              offset: 0,
              sortBy: { column: 'created_at', order: 'desc' },
            });

          if (!error && data) {
            const filesInFolder = data
              .filter((item) => item.name && item.name !== '.emptyFolderPlaceholder')
              .map((item) => {
                const fullPath = `${folder}/${item.name}`;
                const { data: publicData } = supabase.storage
                  .from('website-images')
                  .getPublicUrl(fullPath);

                return {
                  id: item.id || fullPath,
                  name: item.name,
                  folder: folder,
                  fullPath: fullPath,
                  size: item.metadata?.size || 0,
                  created_at: item.created_at || new Date().toISOString(),
                  publicUrl: publicData.publicUrl,
                };
              });
            allFiles = [...allFiles, ...filesInFolder];
          }
        } catch (fErr) {
          console.warn(`Error listing files in folder ${folder}:`, fErr);
        }
      }

      setFiles(allFiles);
    } catch (err) {
      console.error('Error fetching media files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMediaFiles();
  }, []);

  const handleFileSelect = (e) => {
    setValidationError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setValidationError('Only JPG, JPEG, PNG, and WEBP image formats are supported.');
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      setValidationError('File size exceeds the 5MB limit.');
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      if (!supabase) {
        showNotification('error', 'Supabase storage is not configured.');
        setIsUploading(false);
        return;
      }

      const fileExt = selectedFile.name.split('.').pop();
      const sanitizedName = selectedFile.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .toLowerCase();
      const fileName = `${uploadFolder}/${Date.now()}_${sanitizedName}`;

      const { data, error } = await supabase.storage
        .from('website-images')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;

      showNotification('success', `File "${selectedFile.name}" uploaded successfully!`);
      setSelectedFile(null);
      setFilePreview(null);
      fetchAllMediaFiles();
    } catch (err) {
      console.error('Error uploading file:', err);
      showNotification('error', `Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    showNotification('success', 'Image URL copied to clipboard!');
  };

  const handleDeleteExecute = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (supabase) {
        await supabase.storage
          .from('website-images')
          .remove([deleteTarget.fullPath]);
      }

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

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[#e9d5ff]/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#ec4899]">
            Assets & Media
          </p>
          <h2 className="mt-1 text-3xl font-bold text-[#2e1f3b]">Media Library</h2>
          <p className="mt-1 text-sm font-medium text-[#2e1f3b]/75">
            Upload, preview, copy URLs, search, and manage your website images in Storage.
          </p>
        </div>
      </div>

      {/* Section 1: Upload Box */}
      <div className="rounded-[28px] border border-[#e9d5ff] bg-white p-6 space-y-4 shadow-sm">
        <h3 className="text-lg font-bold text-[#ec4899]">Upload Image Asset</h3>

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_200px]">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
                Target Folder
              </label>
              <select
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-3.5 py-2 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
              >
                <option value="general">General Assets</option>
                <option value="products">Products</option>
                <option value="blog">Blog Posts</option>
                <option value="categories">Categories</option>
                <option value="homepage">Homepage Banners</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={!selectedFile || isUploading}
                className="w-full rounded-xl bg-gradient-to-r from-[#f472b6] to-[#c084fc] py-2 text-sm font-bold text-white transition hover:opacity-95 shadow-md disabled:opacity-40"
              >
                {isUploading ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
          </div>

          {/* File Input Box */}
          <div className="relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#e9d5ff] bg-[#faf4fb] p-4 text-center transition hover:border-[#f472b6] hover:bg-[#fde8f3]/40">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <p className="text-sm font-bold text-[#2e1f3b]">
              {selectedFile ? `Selected: ${selectedFile.name}` : 'Click or Drag & Drop image file to upload'}
            </p>
            <p className="mt-1 text-xs font-medium text-[#2e1f3b]/70">
              Accepted formats: <strong className="text-[#2e1f3b]">JPG, JPEG, PNG, WEBP</strong> (Max file size: 5MB)
            </p>
          </div>

          {/* Validation Warning */}
          {validationError && (
            <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-bold text-rose-700">
              ⚠️ {validationError}
            </div>
          )}

          {/* Preview banner if file selected */}
          {filePreview && (
            <div className="flex items-center gap-4 rounded-2xl border border-[#e9d5ff] bg-[#faf4fb] p-3">
              <div className="h-16 w-16 overflow-hidden rounded-xl border border-[#e9d5ff] bg-white">
                <img src={filePreview} alt="Selected preview" className="h-full w-full object-cover" />
              </div>
              <div className="text-xs text-[#2e1f3b]">
                <p className="font-bold text-[#2e1f3b]">{selectedFile?.name}</p>
                <p className="text-[#2e1f3b]/70 font-medium">
                  Size: {((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB • Format: {selectedFile?.type}
                </p>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Section 2: Toolbar (Search & Folder Filters) */}
      <div className="grid gap-4 rounded-[24px] border border-[#e9d5ff] bg-white p-4 sm:grid-cols-2 shadow-sm">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
            Search Files
          </label>
          <input
            type="text"
            placeholder="Search by filename or folder..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-3.5 py-2 text-sm font-semibold text-[#2e1f3b] placeholder-[#2e1f3b]/40 focus:border-[#f472b6] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#2e1f3b] mb-1.5">
            Folder Filter
          </label>
          <select
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value)}
            className="w-full rounded-xl border border-[#e9d5ff] bg-[#faf4fb] px-3.5 py-2 text-sm font-semibold text-[#2e1f3b] focus:border-[#f472b6] focus:outline-none"
          >
            <option value="all">All Folders</option>
            <option value="products">Products</option>
            <option value="blog">Blog Posts</option>
            <option value="categories">Categories</option>
            <option value="homepage">Homepage</option>
            <option value="general">General</option>
          </select>
        </div>
      </div>

      {/* Media Count Summary */}
      <div className="flex items-center justify-between text-xs font-semibold text-[#2e1f3b]/70 px-1">
        <p>
          Showing <span className="font-bold text-[#2e1f3b]">{filteredFiles.length}</span> of{' '}
          <span className="font-bold text-[#2e1f3b]">{files.length}</span> images in Storage
        </p>
        <button
          onClick={fetchAllMediaFiles}
          className="text-[#ec4899] font-bold hover:underline flex items-center gap-1"
        >
          <span>🔄</span> Refresh Library
        </button>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="rounded-[28px] border border-[#e9d5ff] bg-white p-12 text-center text-[#2e1f3b]/70 font-medium animate-pulse">
          Loading Media Library...
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="rounded-[28px] border border-[#e9d5ff] bg-white p-12 text-center shadow-sm">
          <p className="text-lg font-bold text-[#2e1f3b]">No images found</p>
          <p className="mt-1 text-sm font-medium text-[#2e1f3b]/70">
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
              className="group relative flex flex-col overflow-hidden rounded-[20px] border border-[#e9d5ff] bg-white shadow-sm transition hover:border-[#f472b6] hover:shadow-md"
            >
              {/* Image Preview Box */}
              <div
                onClick={() => setPreviewTarget(file)}
                className="aspect-square w-full cursor-pointer overflow-hidden bg-[#faf4fb]"
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
              <div className="p-3 flex-1 flex flex-col justify-between text-xs space-y-2 text-[#2e1f3b]">
                <div>
                  <p className="truncate font-bold text-[#2e1f3b]" title={file.name}>
                    {file.name}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-[#2e1f3b]/70 font-medium">
                    <span className="uppercase text-[#ec4899] font-bold">{file.folder}</span> •{' '}
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>

                {/* Actions: Copy URL & Delete */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#e9d5ff]">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(file.publicUrl)}
                    className="flex-1 rounded-full border border-[#f472b6]/40 bg-[#fde8f3] px-2 py-1 text-[11px] font-bold text-[#2e1f3b] transition hover:bg-[#f472b6] hover:text-white"
                  >
                    Copy URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(file)}
                    className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-600 hover:text-white transition"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-[32px] border border-[#e9d5ff] bg-white p-6 shadow-2xl space-y-4 text-[#2e1f3b]"
          >
            <div className="flex items-center justify-between border-b border-[#e9d5ff] pb-3">
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-[#ec4899]">
                  {previewTarget.folder}
                </p>
                <h3 className="text-lg font-bold text-[#2e1f3b]">{previewTarget.name}</h3>
              </div>
              <button
                onClick={() => setPreviewTarget(null)}
                className="text-[#2e1f3b]/60 hover:text-[#2e1f3b] text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[450px] overflow-hidden rounded-2xl border border-[#e9d5ff] bg-[#faf4fb] flex items-center justify-center">
              <img
                src={previewTarget.publicUrl}
                alt={previewTarget.name}
                className="max-h-[450px] w-auto object-contain"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-[#2e1f3b]/70 font-medium">
              <div>
                <p>Path: <code className="text-[#2e1f3b] font-bold font-mono">{previewTarget.fullPath}</code></p>
                <p>Size: {((previewTarget.size || 0) / 1024).toFixed(1)} KB</p>
              </div>

              <button
                onClick={() => handleCopyUrl(previewTarget.publicUrl)}
                className="rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-5 py-2 text-xs font-bold text-white shadow"
              >
                Copy Public URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[28px] border border-[#e9d5ff] bg-white p-6 shadow-2xl text-[#2e1f3b]">
            <h3 className="text-lg font-bold text-[#2e1f3b]">Delete Image</h3>
            <p className="mt-2 text-sm font-medium text-[#2e1f3b]/80">
              Are you sure you want to delete{' '}
              <strong className="font-bold text-[#2e1f3b]">"{deleteTarget.name}"</strong>?
              This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#e9d5ff]">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="rounded-full border border-[#e9d5ff] bg-white px-5 py-2 text-xs font-bold text-[#2e1f3b] hover:bg-[#fde8f3]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteExecute}
                disabled={isDeleting}
                className="rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-rose-700 disabled:opacity-50"
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
