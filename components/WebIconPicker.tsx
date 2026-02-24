import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

interface WebIconPickerProps {
    selectedIcon: string;
    onSelect: (iconName: string) => void;
    label?: string;
}

const FA_ICONS = [
    { name: 'Gezilecek Yerler', class: 'fas fa-camera-retro' },
    { name: 'Müzeler', class: 'fas fa-landmark' },
    { name: 'Saray / Köşk', class: 'fas fa-monument' },
    { name: 'Yeme & İçme', class: 'fas fa-utensils' },
    { name: 'Restoran', class: 'fas fa-hamburger' },
    { name: 'Pizza', class: 'fas fa-pizza-slice' },
    { name: 'Kafe', class: 'fas fa-coffee' },
    { name: 'Çay / Kahve', class: 'fas fa-mug-hot' },
    { name: 'Alışveriş', class: 'fas fa-shopping-bag' },
    { name: 'Market', class: 'fas fa-shopping-cart' },
    { name: 'Oteller', class: 'fas fa-hotel' },
    { name: 'Pansiyon', class: 'fas fa-bed' },
    { name: 'Etkinlikler', class: 'fas fa-calendar-alt' },
    { name: 'Tarih', class: 'fas fa-history' },
    { name: 'Kültür', class: 'fas fa-theater-masks' },
    { name: 'Sanat Galerisi', class: 'fas fa-palette' },
    { name: 'Ulaşım', class: 'fas fa-bus' },
    { name: 'Tren', class: 'fas fa-train' },
    { name: 'Taksi', class: 'fas fa-taxi' },
    { name: 'Harita', class: 'fas fa-map-marked-alt' },
    { name: 'Konum', class: 'fas fa-map-marker-alt' },
    { name: 'Camii', class: 'fas fa-mosque' },
    { name: 'Kilise', class: 'fas fa-church' },
    { name: 'Sinagog', class: 'fas fa-synagogue' },
    { name: 'Parklar', class: 'fas fa-tree' },
    { name: 'Doğa', class: 'fas fa-leaf' },
    { name: 'Eğlence', class: 'fas fa-gamepad' },
    { name: 'Sinema', class: 'fas fa-film' },
    { name: 'Müzik', class: 'fas fa-music' },
    { name: 'Gece Hayatı', class: 'fas fa-cocktail' },
    { name: 'Bira / Bar', class: 'fas fa-beer' },
    { name: 'Spor', class: 'fas fa-running' },
    { name: 'Futbol', class: 'fas fa-futbol' },
    { name: 'Sağlık', class: 'fas fa-hospital' },
    { name: 'Eczane', class: 'fas fa-pills' },
    { name: 'Eğitim', class: 'fas fa-graduation-cap' },
    { name: 'Kütüphane', class: 'fas fa-book' },
    { name: 'Bankamatik', class: 'fas fa-money-check-alt' },
    { name: 'Kredi Kartı', class: 'fas fa-credit-card' },
    { name: 'Bilgi', class: 'fas fa-info-circle' },
    { name: 'Yardım', class: 'fas fa-question-circle' },
    { name: 'Deniz', class: 'fas fa-umbrella-beach' },
    { name: 'Gemi / Tekne', class: 'fas fa-ship' },
    { name: 'Yürüyüş', class: 'fas fa-hiking' },
    { name: 'Bisiklet', class: 'fas fa-bicycle' },
    { name: 'Fotoğraf', class: 'fas fa-camera' },
    { name: 'Video', class: 'fas fa-video' },
    { name: 'Yıldız', class: 'fas fa-star' },
    { name: 'Kalp', class: 'fas fa-heart' },
    { name: 'Bayrak', class: 'fas fa-flag' },
    { name: 'Ateş / Popüler', class: 'fas fa-fire' },
    { name: 'Güneş', class: 'fas fa-sun' },
    { name: 'Ay', class: 'fas fa-moon' },
    { name: 'Bulut', class: 'fas fa-cloud' },
    { name: 'Göz', class: 'fas fa-eye' },
    { name: 'Kullanıcı', class: 'fas fa-user' },
    { name: 'Grup', class: 'fas fa-users' },
    { name: 'Ayarlar', class: 'fas fa-cog' },
    { name: 'Arama', class: 'fas fa-search' },
    { name: 'Telefon', class: 'fas fa-phone' },
    { name: 'Zarf / E-posta', class: 'fas fa-envelope' },
    { name: 'Dünya', class: 'fas fa-globe' },
    { name: 'Mağaza', class: 'fas fa-store' },
    { name: 'Hediye', class: 'fas fa-gift' },
    { name: 'Giriş', class: 'fas fa-sign-in-alt' },
    { name: 'Çıkış', class: 'fas fa-sign-out-alt' },
];

const WebIconPicker: React.FC<WebIconPickerProps> = ({ selectedIcon, onSelect, label }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredIcons = FA_ICONS.filter(icon =>
        icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        icon.class.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-2">
            {/* Font Awesome CSS is required for preview in Admin too */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

            {label && <label className="block text-xs font-medium text-gray-500">{label}</label>}

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className={`${selectedIcon || 'fas fa-question-circle'} text-primary`} />
                    </div>
                    <input
                        type="text"
                        value={selectedIcon}
                        onChange={(e) => onSelect(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-primary bg-white"
                        placeholder="FontAwesome sınıfı (örn: fas fa-home)..."
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
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 z-10">
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

                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5 max-h-48 overflow-y-auto custom-scroll pr-2">
                        {filteredIcons.map((icon) => (
                            <button
                                key={icon.class}
                                type="button"
                                onClick={() => {
                                    onSelect(icon.class);
                                    setIsOpen(false);
                                }}
                                className={`flex flex-col items-center justify-center p-1.5 rounded-md transition-all aspect-square ${selectedIcon === icon.class
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'bg-white text-gray-400 hover:bg-gray-100 border border-gray-50 hover:border-gray-200'
                                    }`}
                                title={icon.name}
                            >
                                <i className={`${icon.class} text-lg`} />
                            </button>
                        ))}
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

export default WebIconPicker;
