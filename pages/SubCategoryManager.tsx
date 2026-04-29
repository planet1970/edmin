import React, { useState, useEffect } from 'react';
import {
  Layers, Plus, Trash2, Edit2, Layout, Image as ImageIcon
} from 'lucide-react';
import { Category, SubCategory, PageLink } from '../types';
import { api, getImageUrl } from '../services/api';
import { useCrud } from '../hooks/useCrud';
import { DataTable, Column } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import ImageUploadField from '../components/ImageUploadField';

const SubCategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pageLinks, setPageLinks] = useState<PageLink[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');

  const {
    data: subs,
    loading,
    fetchData,
    createItem,
    updateItem,
    deleteItem,
    toggleStatus,
  } = useCrud<SubCategory>({ endpoint: '/subcategories' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<SubCategory> | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPassive, setShowPassive] = useState(false);

  useEffect(() => {
    // Load categories for the selector
    api.get<Category[]>('/categories').then(setCategories).catch(console.error);
    // Load page links for the designer select
    api.get<PageLink[]>('/page-links').then(setPageLinks).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchData({ categoryId: selectedCategoryId });
    }
  }, [selectedCategoryId, fetchData]);

  const handleAdd = () => {
    if (!selectedCategoryId) return;
    setEditingItem({
      categoryId: selectedCategoryId,
      title: '',
      description: '',
      imageUrl: '',
      isActive: true,
      order: subs.length + 1
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: SubCategory) => {
    setEditingItem(item);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingItem || !selectedCategoryId) return;
    
    try {
      const formData = new FormData();
      formData.append('title', editingItem.title || '');
      formData.append('description', editingItem.description || '');
      formData.append('categoryId', selectedCategoryId.toString());
      formData.append('isActive', (editingItem.isActive ?? true).toString());
      formData.append('order', (editingItem.order || 1).toString());
      if (editingItem.pageDesign) formData.append('pageDesign', editingItem.pageDesign);
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      if (editingItem.id) {
        await updateItem(editingItem.id, formData);
      } else {
        await createItem(formData);
      }
      
      setIsModalOpen(false);
      setEditingItem(null);
      setSelectedFile(null);
    } catch (error) {
      // Handled by useCrud
    }
  };

  const columns: Column<SubCategory>[] = [
    {
      header: 'Görsel',
      accessor: (item) => (
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
          {item.imageUrl ? (
            <img src={getImageUrl(item.imageUrl)} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ImageIcon size={16} />
            </div>
          )}
        </div>
      )
    },
    { header: 'Adı', accessor: 'title', className: 'font-semibold text-gray-900' },
    { header: 'Açıklama', accessor: 'description', className: 'hidden md:table-cell max-w-xs truncate text-gray-500' },
    {
      header: 'Tasarım',
      accessor: (item) => (
        <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 w-fit">
          <Layout size={12} />
          {item.pageDesign || 'Varsayılan'}
        </div>
      )
    },
    {
      header: 'Durum',
      accessor: (item) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {item.isActive ? 'AKTİF' : 'PASİF'}
        </span>
      )
    },
    { header: 'Sıra', accessor: 'order' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Layers className="text-orange-500" size={32} />
            Alt Kategoriler
          </h1>
          <p className="text-gray-500 mt-1">Ana kategorilerin altındaki segmentleri yönetin.</p>
        </div>
        {selectedCategoryId && (
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-200 transition-all font-bold text-sm"
          >
            <Plus size={20} />
            Yeni Alt Kategori
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Ana Kategori Filtresi</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value ? parseInt(e.target.value) : '')}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none font-medium text-gray-700"
            >
              <option value="">Lütfen kategori seçin...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div className="pt-6">
            <button
              onClick={() => setShowPassive(!showPassive)}
              className={`w-full md:w-auto px-6 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                showPassive ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {showPassive ? 'Pasifleri Gizle' : 'Pasifleri Göster'}
            </button>
          </div>
        </div>
      </div>

      {selectedCategoryId ? (
        <DataTable
          data={subs.filter(s => showPassive || s.isActive).sort((a, b) => (a.order || 0) - (b.order || 0))}
          columns={columns}
          loading={loading}
          onEdit={handleEdit}
          onDelete={deleteItem}
          onToggle={toggleStatus}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Layers size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">İçerikleri görmek için yukarıdan bir kategori seçin.</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem?.id ? 'Alt Kategoriyi Düzenle' : 'Yeni Alt Kategori Ekle'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Alt Kategori Adı</label>
              <input
                type="text"
                value={editingItem?.title || ''}
                onChange={(e) => setEditingItem({ ...editingItem!, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
                placeholder="Örn: Kebapçılar"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Sayfa Tasarımı</label>
              <select
                value={editingItem?.pageDesign || ''}
                onChange={(e) => setEditingItem({ ...editingItem!, pageDesign: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
              >
                <option value="">Varsayılan (Liste)</option>
                {pageLinks.map(link => (
                  <option key={link.id} value={link.slug}>{link.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Açıklama</label>
            <input
              type="text"
              value={editingItem?.description || ''}
              onChange={(e) => setEditingItem({ ...editingItem!, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
              placeholder="Alt kategori hakkında kısa açıklama..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Sıralama</label>
                <input
                  type="number"
                  value={editingItem?.order || 0}
                  onChange={(e) => setEditingItem({ ...editingItem!, order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
                />
              </div>
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                <input
                  type="checkbox"
                  id="subIsActive"
                  checked={editingItem?.isActive || false}
                  onChange={(e) => setEditingItem({ ...editingItem!, isActive: e.target.checked })}
                  className="w-5 h-5 text-orange-500 rounded-lg focus:ring-orange-500"
                />
                <label htmlFor="subIsActive" className="text-sm font-medium text-orange-800 cursor-pointer">
                  Aktif olarak işaretle
                </label>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <ImageUploadField
                label="Kategori Görseli"
                value={editingItem?.imageUrl ? getImageUrl(editingItem.imageUrl) : undefined}
                previewUrl={selectedFile ? URL.createObjectURL(selectedFile) : undefined}
                onFileSelect={setSelectedFile}
                recommendedSize="800x600px"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Vazgeç
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-100 transition-all font-bold text-sm"
            >
              Kaydet
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SubCategoryManager;
