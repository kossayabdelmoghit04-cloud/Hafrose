import { useState, useRef } from 'react';
import { FiCamera, FiUpload } from 'react-icons/fi';

export default function AvatarUploader({ currentAvatar, onAvatarChange, className = '' }) {
  const [preview, setPreview] = useState(currentAvatar || null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('L\'image ne doit pas dépasser 2 Mo.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onAvatarChange?.(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-rose-gold/40 bg-luxury-charcoal flex items-center justify-center text-off-white font-serif text-2xl shadow-md">
        {preview ? (
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="tracking-widest">MH</span>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 bg-anthracite/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 font-sans text-[10px] uppercase tracking-wider cursor-pointer"
          aria-label="Changer la photo de profil"
        >
          <FiCamera size={18} />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="font-sans text-[10px] uppercase tracking-widest text-warm-gray hover:text-rose-gold transition-colors flex items-center gap-1.5"
      >
        <FiUpload size={11} />
        Changer de photo (max 2Mo)
      </button>
    </div>
  );
}
