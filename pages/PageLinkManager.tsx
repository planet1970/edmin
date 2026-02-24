import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save } from 'lucide-react';
import { pageLinksService } from '../services/pageLinks';
import { PageLink } from '../types';

const PageLinkManager: React.FC = () => {
    const [links, setLinks] = useState<PageLink[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingLink, setEditingLink] = useState<Partial<PageLink>>({});

    const loadLinks = async () => {
        setLoading(true);
        try {
            const data = await pageLinksService.list();
            setLinks(data);
        } catch (err: any) {
            setError(err.message || 'Bağlantılar yüklenemedi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLinks();
    }, []);

    const handleSave = async () => {
        if (!editingLink.title || !editingLink.slug) {
            alert('Başlık ve Slug zorunludur.');
            return;
        }
        setLoading(true);
        try {
            if (editingLink.id) {
                await pageLinksService.update(editingLink.id, editingLink as any);
            } else {
                await pageLinksService.create(editingLink as any);
            }
            setIsEditing(false);
            setEditingLink({});
            loadLinks();
        } catch (err: any) {
            setError(err.message || 'Kaydedilemedi.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
        setLoading(true);
        try {
            await pageLinksService.remove(id);
            loadLinks();
        } catch (err: any) {
            setError(err.message || 'Silinemedi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Sayfa Bağlantıları</h1>
                {!isEditing && (
                    <button onClick={() => { setIsEditing(true); setEditingLink({}); }} className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm">
                        <Plus size={18} /> Yeni Ekle
                    </button>
                )}
            </div>

            {error && <div className="text-red-600 mb-4">{error}</div>}

            {isEditing ? (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-2xl">
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Adı</label>
                            <input
                                value={editingLink.title || ''}
                                onChange={e => setEditingLink({ ...editingLink, title: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                            <input
                                value={editingLink.slug || ''}
                                onChange={e => setEditingLink({ ...editingLink, slug: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                            <textarea
                                value={editingLink.description || ''}
                                onChange={e => setEditingLink({ ...editingLink, description: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hedef Tablo</label>
                            <select
                                value={editingLink.targetTable || 'PLACE'}
                                onChange={e => setEditingLink({ ...editingLink, targetTable: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-primary bg-white"
                            >
                                <option value="PLACE">Standart Mekanlar (Tarihi)</option>
                                <option value="FOOD_PLACE">Yeme & İçme Mekanları</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">İptal</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-600">Kaydet</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 border-b font-medium text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4">Adı</th>
                                <th className="px-6 py-4">Slug</th>
                                <th className="px-6 py-4">Açıklama</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {links.length === 0 ? (
                                <tr><td colSpan={4} className="p-6 text-center text-gray-400">Kayıt bulunamadı.</td></tr>
                            ) : (
                                links.map(link => (
                                    <tr key={link.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-800">{link.title}</td>
                                        <td className="px-6 py-4 text-gray-500">{link.slug}</td>
                                        <td className="px-6 py-4 text-gray-500">{link.description}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => { setEditingLink(link); setIsEditing(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={18} /></button>
                                                <button onClick={() => handleDelete(link.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PageLinkManager;
