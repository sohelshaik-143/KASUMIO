import React, { useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';

/**
 * EvidencePhotoUploader - Handles photo/screenshot selection, validation, and preview.
 * Keeps evidence form modular and within size standards.
 */
export const EvidencePhotoUploader = ({
  photoDataUrl,
  photoFileName,
  onPhotoSelected,
  onPhotoRemoved,
  onError,
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onError('Image file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      onPhotoSelected(event.target.result, file.name);
    };
    reader.onerror = () => {
      onError('Could not read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    onPhotoRemoved();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
          Evidence Screenshot / Photo Proof <span className="text-rose-500">*</span>
        </label>
        <span className="text-[11px] text-slate-500 font-medium">PNG, JPG, WEBP (max 5MB)</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        className="hidden"
        id="evidence-photo-input"
      />

      {photoDataUrl ? (
        <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-2.5 flex items-center gap-3">
          <img
            src={photoDataUrl}
            alt="Evidence preview"
            className="w-16 h-16 rounded-lg object-cover border border-slate-200 shadow-2xs shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">
              {photoFileName || 'Evidence Screenshot'}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <span>✓ Photo attached successfully</span>
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-medium underline mt-1"
            >
              Replace photo
            </button>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
            aria-label="Remove photo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer transition bg-slate-50/50 hover:bg-blue-50/20 group focus:outline-hidden focus:ring-2 focus:ring-blue-600"
        >
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <div className="w-9 h-9 rounded-full bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center transition">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-slate-800">
              Upload screenshot proof <span className="text-blue-600 font-bold">(Required)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Provide visual confirmation of your repository, build, test pass, or certificate
            </p>
          </div>
        </button>
      )}
    </div>
  );
};

export default EvidencePhotoUploader;
