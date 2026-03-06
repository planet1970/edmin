import React, { useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';

interface Props {
    label: string;
    value?: string; // current image URL
    onFileSelect: (file: File | null) => void;
    previewUrl?: string; // local preview URL
    error?: string;
    disabled?: boolean;
    isReadOnly?: boolean;
    recommendedSize?: string;
}

const ImageUploadField: React.FC<Props> = ({
    label, value, onFileSelect, previewUrl, error: externalError, disabled, isReadOnly, recommendedSize
}) => {
    const [localError, setLocalError] = useState<string | null>(null);
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setLocalError(null);

        if (!file) {
            onFileSelect(null);
            return;
        }

        // Validate Type
        if (!ALLOWED_TYPES.includes(file.type)) {
            setLocalError('Sadece görsel dosyaları (JPG, PNG, WEBP, GIF) kabul edilir.');
            onFileSelect(null);
            return;
        }

        // Validate Size
        if (file.size > MAX_SIZE) {
            setLocalError(`Dosya boyutu çok büyük (${(file.size / 1024 / 1024).toFixed(2)}MB). Maksimum limit: 2MB.`);
            onFileSelect(null);
            return;
        }

        onFileSelect(file);
    };

    const displayError = externalError || localError;

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <label className="block text-sm font-bold text-gray-700">{label}</label>
                {recommendedSize && <span className="text-[10px] text-gray-400 font-medium">Önerilen: {recommendedSize}</span>}
            </div>

            {(previewUrl || value) && (
                <div className="relative group">
                    <img
                        src={previewUrl || value}
                        className="w-full h-48 object-cover rounded-xl border shadow-sm transition-opacity group-hover:opacity-90"
                        alt="Preview"
                    />
                    {!isReadOnly && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/40 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                                Görseli Değiştir
                            </div>
                        </div>
                    )}
                </div>
            )}

            {(!isReadOnly || (!value && !previewUrl)) && (
                <label className={`
                    flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed rounded-xl transition-all duration-200
                    ${displayError ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-200 bg-gray-50/50 text-gray-500 hover:border-primary hover:bg-primary/5'}
                    ${(disabled || isReadOnly) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}>
                    <Upload size={20} />
                    <span className="font-medium text-sm">Görsel Seç</span>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={disabled || isReadOnly}
                        onChange={handleFileChange}
                    />
                </label>
            )}

            {displayError && (
                <div className="flex items-center gap-1.5 text-red-500 text-xs font-medium animate-in slide-in-from-top-1">
                    <AlertCircle size={14} />
                    <span>{displayError}</span>
                </div>
            )}
        </div>
    );
};

export default ImageUploadField;
