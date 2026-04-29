import React, { useState } from 'react';
import {
    Layout, Image as ImageIcon, Newspaper, Globe, Share2
} from 'lucide-react';
import { HeroManager } from '../components/web-home/HeroManager';
import { SocialManager } from '../components/web-home/SocialManager';
import { NavbarManager } from '../components/web-home/NavbarManager';
import { NewsManager } from '../components/web-home/NewsManager';

const WebHomeScreenManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'hero' | 'social' | 'navbar' | 'news'>('hero');

    const tabs = [
        { id: 'hero', label: 'Hero Slider', icon: <ImageIcon size={18} />, color: 'orange' },
        { id: 'navbar', label: 'Header & Logo', icon: <Layout size={18} />, color: 'blue' },
        { id: 'social', label: 'Sosyal Medya', icon: <Share2 size={18} />, color: 'purple' },
        { id: 'news', label: 'Haber Bandı', icon: <Newspaper size={18} />, color: 'green' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-4">
                        <Globe className="text-orange-500" size={40} />
                        Web Ana Sayfa Yönetimi
                    </h1>
                    <p className="text-gray-500 font-medium text-lg">Web sitesinin vitrin bölümlerini buradan modüler olarak düzenleyin.</p>
                </div>
            </div>

            {/* Modern Tab Navigation */}
            <div className="flex flex-wrap gap-2 bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                            activeTab === tab.id
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 scale-105'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'hero' && <HeroManager />}
                {activeTab === 'navbar' && <NavbarManager />}
                {activeTab === 'social' && <SocialManager />}
                {activeTab === 'news' && <NewsManager />}
            </div>

            {/* Footer Status */}
            <div className="pt-8 border-t border-gray-100 text-center">
                <div className="text-xs text-gray-400 flex items-center justify-center gap-2 font-medium uppercase tracking-widest">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Tüm sistemler aktif ve senkronize çalışıyor
                </div>
            </div>
        </div>
    );
};

export default WebHomeScreenManager;
