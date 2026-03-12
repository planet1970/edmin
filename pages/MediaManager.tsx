import React, { useState, useEffect } from 'react';
import { Image, Trash2, HardDrive, FileImage, BarChart3, Loader2, Search, ExternalLink } from 'lucide-react';
import { mediaService, CloudinaryResource, CloudinaryUsageResponse } from '../services/media';
import { toast } from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';

const MediaManager: React.FC = () => {
    const [resources, setResources] = useState<CloudinaryResource[]>([]);
    const [stats, setStats] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showBulkDelete, setShowBulkDelete] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [mediaRes, statsRes] = await Promise.all([
                mediaService.list(),
                mediaService.getStats()
            ]);
            setResources(mediaRes.resources || []);
            setStats(statsRes);
        } catch (error) {
            console.error('Failed to fetch media data:', error);
            toast.error('Medya verileri yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async () => {
        if (!deleteId && selectedIds.length === 0) return;

        try {
            if (deleteId) {
                await mediaService.delete(deleteId);
                toast.success('Dosya başarıyla silindi');
            } else {
                await Promise.all(selectedIds.map(id => mediaService.delete(id)));
                toast.success(`${selectedIds.length} dosya başarıyla silindi`);
                setSelectedIds([]);
            }
            fetchData();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Dosya silinemedi');
        } finally {
            setDeleteId(null);
            setShowBulkDelete(false);
        }
    };

    const toggleSelect = (publicId: string) => {
        setSelectedIds(prev =>
            prev.includes(publicId)
                ? prev.filter(id => id !== publicId)
                : [...prev, publicId]
        );
    };

    const selectAll = () => {
        if (selectedIds.length === filteredResources.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredResources.map(res => res.public_id));
        }
    };

    const filteredResources = resources.filter(res =>
        res.public_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatBytes = (bytes: any) => {
        const numBytes = Number(bytes);
        if (isNaN(numBytes) || numBytes <= 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(numBytes) / Math.log(k));
        return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Helper to get nested stats safely
    const getStat = (obj: any, path: string) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj) || 0;
    };

    if (loading && resources.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary w-10 h-10" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold mb-2">Medya Yönetimi (Cloudinary)</h1>
                    <p className="text-gray-400">Yüklenen tüm görselleri yönetin</p>
                </div>
                <div className="flex items-center gap-4">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={() => setShowBulkDelete(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                            <Trash2 size={18} />
                            <span>Seçilenleri Sil ({selectedIds.length})</span>
                        </button>
                    )}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Dosya ara..."
                            className="pl-10 pr-4 py-2 bg-sidebar border border-gray-700 rounded-lg text-white w-full md:w-64 focus:border-primary outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-sidebar p-6 rounded-xl border border-gray-800 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                            <FileImage className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Toplam Görsel</p>
                            <h3 className="text-2xl font-bold text-white">{resources.length}</h3>
                        </div>
                    </div>
                    <div className="bg-sidebar p-6 rounded-xl border border-gray-800 flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500">
                            <HardDrive className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Kullanılan Alan</p>
                            <h3 className="text-2xl font-bold text-white">{formatBytes(getStat(stats, 'storage.usage') || getStat(stats, 'storage.used'))}</h3>
                        </div>
                    </div>
                    <div className="bg-sidebar p-6 rounded-xl border border-gray-800 flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Bandwidth (Kullanılan)</p>
                            <h3 className="text-2xl font-bold text-white">{formatBytes(getStat(stats, 'bandwidth.usage') || getStat(stats, 'bandwidth.used'))}</h3>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={selectAll}
                        className="text-sm text-gray-400 hover:text-primary transition-colors"
                    >
                        {selectedIds.length === filteredResources.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                    </button>
                    <span className="text-sm text-gray-500">{filteredResources.length} dosya gösteriliyor</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredResources.map((res) => (
                    <div
                        key={res.public_id}
                        className={`bg-sidebar rounded-xl border overflow-hidden group transition-all duration-300 relative ${selectedIds.includes(res.public_id) ? 'border-primary ring-1 ring-primary' : 'border-gray-800 hover:border-gray-600'}`}
                    >
                        {/* Checkbox */}
                        <div className={`absolute top-3 left-3 z-20 w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-all ${selectedIds.includes(res.public_id) ? 'bg-primary border-primary text-white' : 'bg-black/50 border-gray-500 opacity-0 group-hover:opacity-100'}`}
                            onClick={() => toggleSelect(res.public_id)}>
                            {selectedIds.includes(res.public_id) && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                        </div>

                        <div className="aspect-video relative overflow-hidden bg-black/20 cursor-pointer" onClick={() => toggleSelect(res.public_id)}>
                            <img
                                src={res.secure_url}
                                alt={res.public_id}
                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <a
                                    href={res.secure_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
                                    onClick={(e) => e.stopPropagation()}
                                    title="Resmi Görüntüle"
                                >
                                    <ExternalLink className="w-5 h-5 text-white" />
                                </a>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteId(res.public_id);
                                    }}
                                    className="w-10 h-10 bg-red-500/20 hover:bg-red-500/40 rounded-full flex items-center justify-center backdrop-blur-sm transition-all text-red-500"
                                    title="Sil"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <p className="text-sm font-medium text-gray-200 truncate mb-1" title={res.public_id}>
                                {res.public_id}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>{res.width}x{res.height}</span>
                                <span>{formatBytes(res.bytes)}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-2">
                                {new Date(res.created_at).toLocaleDateString('tr-TR')} {new Date(res.created_at).toLocaleTimeString('tr-TR')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {filteredResources.length === 0 && !loading && (
                <div className="text-center py-20 bg-sidebar/50 rounded-2xl border border-dashed border-gray-800">
                    <Image className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400">Dosya bulunamadı</h3>
                </div>
            )}

            <ConfirmDialog
                isOpen={deleteId !== null || showBulkDelete}
                onClose={() => {
                    setDeleteId(null);
                    setShowBulkDelete(false);
                }}
                onConfirm={handleDelete}
                title={showBulkDelete ? "Toplu Silme" : "Dosyayı Sil"}
                message={showBulkDelete
                    ? `Seçilen ${selectedIds.length} dosyayı silmek istediğinize emin misiniz?`
                    : `"${deleteId}" dosyasını silmek istediğinize emin misiniz?`}
                confirmText="Evet, Sil"
                cancelText="Vazgeç"
                type="danger"
            />
        </div>
    );
};

export default MediaManager;
