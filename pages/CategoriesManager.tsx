import React, { useState, useEffect } from 'react';
import {
  Plus, Grid, Smartphone, Globe
} from 'lucide-react';
import { Category } from '../types';
import { useCrud } from '../hooks/useCrud';
import { DataTable, Column } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import IconPicker from '../components/IconPicker';
import WebIconPicker from '../components/WebIconPicker';
import * as LucideIcons from 'lucide-react';

const CategoriesManager: React.FC = () => {
  const {
    data: categories,
    loading,
    fetchData,
    createItem,
    updateItem,
    deleteItem,
    toggleStatus,
  } = useCrud<Category>({ endpoint: '/categories' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Category> | null>(null);
  const [showPassive, setShowPassive] = useState(false);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = () => {
    setEditingItem({
      title: '',
      description: '',
      iconName: 'Home',
      webIcon: 'fas fa-map-marked-alt',
      isActive: true,
      order: categories.length + 1
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: Category) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingItem) return;
    try {
      if (editingItem.id) {
        await updateItem(editingItem.id, editingItem);
      } else {
        await createItem(editingItem);
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      // Error handled by useCrud
    }
  };

  const columns: Column<Category>[] = [
    {
      header: 'İkon',
      accessor: (item) => (
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-orange-50 text-orange-500 rounded flex items-center justify-center border border-orange-100" title="Mobil">
             {/* @ts-ignore */}
            {LucideIcons[item.iconName] ? React.createElement(LucideIcons[item.iconName], { size: 16 }) : '?'}
          </div>
          <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded flex items-center justify-center border border-blue-100" title="Web">
            <i className={`${item.webIcon || 'fas fa-map-marked-alt'} text-sm`} />
          </div>
        </div>
      )
    },
    { header: 'Kategori Adı', accessor: 'title' },
    { header: 'Açıklama', accessor: 'description', className: 'hidden md:table-cell max-w-xs truncate' },
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

  const filteredCategories = categories
    .filter(c => showPassive || c.isActive)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Grid className="text-orange-500" size={32} />
            Kategori Yönetimi
          </h1>
          <p className="text-gray-500 mt-1">Uygulama genelindeki ana kategorileri buradan düzenleyebilirsiniz.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowPassive(!showPassive)}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
              showPassive ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {showPassive ? 'Pasifleri Gizle' : 'Pasifleri Göster'}
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-200 transition-all font-semibold text-sm"
          >
            <Plus size={20} />
            Yeni Kategori
          </button>
        </div>
      </div>

      <DataTable
        data={filteredCategories}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDelete={deleteItem}
        onToggle={toggleStatus}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem?.id ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Kategori Adı</label>
              <input
                type="text"
                value={editingItem?.title || ''}
                onChange={(e) => setEditingItem({ ...editingItem!, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
                placeholder="Örn: Restoranlar"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Sıralama</label>
              <input
                type="number"
                value={editingItem?.order || 0}
                onChange={(e) => setEditingItem({ ...editingItem!, order: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Açıklama</label>
            <textarea
              value={editingItem?.description || ''}
              onChange={(e) => setEditingItem({ ...editingItem!, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none min-h-[100px]"
              placeholder="Kategori hakkında kısa bilgi..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-widest">
                <Smartphone size={16} /> Mobil İkon
              </div>
              <IconPicker
                selectedIcon={editingItem?.iconName || 'Home'}
                onSelect={(iconName) => setEditingItem({ ...editingItem!, iconName })}
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
                <Globe size={16} /> Web İkon
              </div>
              <WebIconPicker
                selectedIcon={editingItem?.webIcon || 'fas fa-map-marked-alt'}
                onSelect={(webIcon) => setEditingItem({ ...editingItem!, webIcon })}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
            <input
              type="checkbox"
              id="isActive"
              checked={editingItem?.isActive || false}
              onChange={(e) => setEditingItem({ ...editingItem!, isActive: e.target.checked })}
              className="w-5 h-5 text-orange-500 rounded-lg focus:ring-orange-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-orange-800 cursor-pointer">
              Bu kategoriyi hemen yayına al
            </label>
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

export default CategoriesManager;
