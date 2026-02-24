import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { iconMap } from '../constants/iconMap';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

interface IconPickerProps {
    selectedIcon: string;
    onSelect: (iconName: string) => void;
    label?: string;
}

const ICON_MAP_LUCIDE = LucideIcons;

const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onSelect, label }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredIcons = Object.keys(iconMap).filter(key =>
        key.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // @ts-ignore
    const SelectedIconComp = ICON_MAP_LUCIDE[selectedIcon] || LucideIcons.HelpCircle;

    return (
        <div className="space-y-2">
            {label && <label className="block text-xs font-medium text-gray-500">{label}</label>}

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SelectedIconComp size={16} className="text-primary" />
                    </div>
                    <input
                        type="text"
                        value={selectedIcon}
                        onChange={(e) => onSelect(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-primary bg-white"
                        placeholder="İkon adı..."
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium border border-gray-200"
                >
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    Seç
                </button>
            </div>

            {isOpen && (
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="relative mb-3">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={14} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-primary bg-gray-50"
                            placeholder="İkon ara..."
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1.5 max-h-48 overflow-y-auto custom-scroll pr-2">
                        {filteredIcons.map((iconKey) => {
                            // @ts-ignore
                            const IconComp = ICON_MAP_LUCIDE[iconKey];
                            if (!IconComp) return null;
                            return (
                                <button
                                    key={iconKey}
                                    type="button"
                                    onClick={() => {
                                        onSelect(iconKey);
                                        setIsOpen(false);
                                    }}
                                    className={`flex flex-col items-center justify-center p-1.5 rounded-md transition-all aspect-square ${selectedIcon === iconKey
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-white text-gray-400 hover:bg-gray-100 border border-gray-50 hover:border-gray-200'
                                        }`}
                                    title={iconKey}
                                >
                                    <IconComp size={14} />
                                </button>
                            )
                        })}
                        {filteredIcons.length === 0 && (
                            <div className="col-span-full text-center py-4 text-xs text-gray-400">
                                İkon bulunamadı.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default IconPicker;
