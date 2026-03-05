
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

interface Option {
    id: string | number;
    label: string;
    subLabel?: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string | number | null;
    onChange: (value: string | number) => void;
    placeholder?: string;
    label?: string;
    loading?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Seçiniz...',
    label,
    loading = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = useMemo(() => {
        return options.filter(opt =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (opt.subLabel && opt.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [options, searchTerm]);

    const selectedOption = useMemo(() => {
        return options.find(opt => opt.id === value);
    }, [options, value]);

    return (
        <div className="relative" ref={wrapperRef}>
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}

            <div
                onClick={() => !loading && setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full px-4 py-2 border rounded-lg cursor-pointer transition-all bg-white
                ${isOpen ? 'border-primary ring-2 ring-primary/10' : 'border-gray-200'}
                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'}`}
            >
                <div className="truncate flex-1">
                    {selectedOption ? (
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-800">{selectedOption.label}</span>
                            {selectedOption.subLabel && <span className="text-[10px] text-gray-400">{selectedOption.subLabel}</span>}
                        </div>
                    ) : (
                        <span className="text-sm text-gray-400">{placeholder}</span>
                    )}
                </div>
                <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl animate-scaleIn origin-top">
                    <div className="p-2 border-b border-gray-100 flex items-center gap-2">
                        <Search size={16} className="text-gray-400" />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Ara..."
                            className="w-full text-sm outline-none bg-transparent py-1"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && <X size={14} className="text-gray-400 cursor-pointer" onClick={() => setSearchTerm('')} />}
                    </div>

                    <div className="max-h-60 overflow-y-auto py-1">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-400 text-center italic">Sonuç bulunamadı</div>
                        ) : (
                            filteredOptions.map(opt => (
                                <div
                                    key={opt.id}
                                    onClick={() => {
                                        onChange(opt.id);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={`px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between group
                                    ${opt.id === value ? 'bg-primary/5 text-primary' : 'text-gray-700'}`}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{opt.label}</span>
                                        {opt.subLabel && <span className={`text-[10px] ${opt.id === value ? 'text-primary/60' : 'text-gray-400'}`}>{opt.subLabel}</span>}
                                    </div>
                                    {opt.id === value && <Check size={16} className="text-primary" />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
