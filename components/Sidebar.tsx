import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Smartphone, Layers, Home, ListTree, FilePlus, Database, FileCode, Server, FileText, Users, UserCog, UserCheck, ChevronDown, Grid, Globe } from 'lucide-react';
import { NavItem } from '../types';
import { api } from '../services/api';

const initialMenuItems: { category: string; items: NavItem[] }[] = [
    {
        category: 'YÖNETİM',
        items: [
            { title: 'Özet / Dashboard', icon: LayoutDashboard, path: '/' },
            { title: 'Ana Ekran (Mobil)', icon: Home, path: '/home-screen' },
            { title: 'Ana Ekran (Web)', icon: Globe, path: '/web-home' },
            { title: 'Kategoriler', icon: Grid, path: '/categories' },
            { title: 'Alt Kategoriler', icon: ListTree, path: '/sub-categories' },
            { title: 'Sayfa Yetkili', icon: FileText, path: '/page-content' },
            {
                title: 'Sayfa Tanım',
                icon: Layers,
                path: '/page-design'
            },
            { title: 'Splash Screen', icon: Layers, path: '/splash' },
            { title: 'Onboarding', icon: Smartphone, path: '/onboarding' },
        ],
    },
    {
        category: 'MÜŞTERİ',
        items: [
            { title: 'Sayfalarım', icon: UserCheck, path: '/my-pages' },
        ],
    },
    {
        category: 'DATABASE',
        items: [
            { title: 'Database Tanım', icon: Database, path: '/database-definitions' },
            { title: 'Sayfa Bağlantı', icon: FileCode, path: '/page-links' },
            {
                title: 'DB Yönetimi',
                icon: Server,
                path: '#db-management', // Non-routable path
                subItems: []
            },
        ],
    },
    {
        category: 'KULLANICI',
        items: [
            { title: 'Kullanıcılar', icon: Users, path: '/users' },
            { title: 'Kullanıcı Tipi', icon: UserCog, path: '/user-types' },
        ],
    },
];

const Sidebar: React.FC = () => {
    const [menuItems, setMenuItems] = useState(initialMenuItems);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const location = useLocation();

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const tables = await api.get<string[]>('/tables');
                const tableSubItems: NavItem[] = tables.map(table => ({
                    title: table,
                    icon: Database,
                    path: `/database-manager/${table}`,
                }));

                setMenuItems(prevItems => {
                    const newItems = [...prevItems];
                    const dbCategory = newItems.find(item => item.category === 'DATABASE');
                    if (dbCategory) {
                        const dbManagementItem = dbCategory.items.find(item => item.title === 'DB Yönetimi');
                        if (dbManagementItem) {
                            dbManagementItem.subItems = tableSubItems;
                        }
                    }
                    return newItems;
                });
            } catch (error) {
                console.error("Failed to fetch tables:", error);
            }
        };

        fetchTables();
    }, []);

    useEffect(() => {
        const currentPath = location.pathname;
        for (const category of menuItems) {
            for (const item of category.items) {
                if (item.subItems && item.subItems.some(sub => currentPath.startsWith(sub.path))) {
                    setOpenDropdown(item.title);
                    return;
                }
            }
        }
    }, [location.pathname, menuItems]);

    const toggleDropdown = (title: string) => {
        setOpenDropdown(openDropdown === title ? null : title);
    };

    const isDropdownActive = (item: NavItem) => {
        if (!item.subItems) return false;
        return item.subItems.some(sub => location.pathname.startsWith(sub.path));
    }

    return (
        <aside className="w-64 bg-sidebar text-gray-300 h-screen fixed left-0 top-0 flex flex-col border-r border-gray-800 z-50 transition-all duration-300">
            <div className="h-20 flex items-center px-6 border-b border-gray-800">
                <div className="flex items-center gap-3 text-white font-bold text-2xl tracking-wider">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-900/20">E</div>
                    EDMIN
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scroll py-6">
                {menuItems.map((section, idx) => (
                    <div key={idx} className="mb-8">
                        <h3 className="px-6 text-[13px] font-bold uppercase tracking-widest mb-3 text-gray-400 opacity-100">
                            {section.category}
                        </h3>
                        <ul className="space-y-2">
                            {section.items.map((item) => (
                                <li key={item.title}>
                                    {item.subItems && item.subItems.length > 0 ? (
                                        <div>
                                            <div
                                                className={`flex items-center justify-between gap-4 px-6 py-3.5 text-[15px] font-medium transition-all duration-200 cursor-pointer border-l-[3px] ${openDropdown === item.title || isDropdownActive(item) ? 'bg-[#252b3b] text-white border-primary' : 'border-transparent text-gray-400 hover:text-gray-100 hover:bg-[#252b3b]/50'}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleDropdown(item.title);
                                                }}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <item.icon size={22} className={`transition-colors duration-200 ${openDropdown === item.title || isDropdownActive(item) ? 'text-primary' : 'text-gray-400'}`} />
                                                    <span>{item.title}</span>
                                                </div>
                                                <ChevronDown size={16} className={`transition-transform duration-200 ${openDropdown === item.title ? 'rotate-180' : ''}`} />
                                            </div>
                                            {openDropdown === item.title && (
                                                <ul className="pl-12 pt-2 space-y-2">
                                                    {item.subItems.map(subItem => (
                                                        <li key={subItem.path}>
                                                            <NavLink to={subItem.path} className={({ isActive }) => `block py-2 text-sm ${isActive ? 'text-primary font-semibold' : 'text-gray-400 hover:text-white'}`}>
                                                                {subItem.title}
                                                            </NavLink>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ) : (
                                        <NavLink
                                            to={item.path}
                                            className={({ isActive }) => `flex items-center gap-4 px-6 py-3.5 text-[15px] font-medium transition-all duration-200 border-l-[3px] ${isActive ? 'bg-[#252b3b] text-white border-primary shadow-[inset_1px_0_0_0_rgba(255,255,255,0.05)]' : 'border-transparent text-gray-400 hover:text-gray-100 hover:bg-[#252b3b]/50'}`}
                                        >
                                            <item.icon size={22} className={`transition-colors duration-200 ${location.pathname === item.path ? 'text-primary' : 'text-gray-400'}`} />
                                            <span>{item.title}</span>
                                        </NavLink>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="p-6 border-t border-gray-800/50 text-xs text-center text-gray-500 font-medium">
                &copy; 2024 Edmin Panel v1.0
            </div>
        </aside>
    );
};

export default Sidebar;
