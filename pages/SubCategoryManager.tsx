import React, { useEffect, useMemo, useState } from 'react';
import { GripVertical, Plus, Trash2, Edit2, XCircle, Upload, CheckCircle } from 'lucide-react';
import { Category, SubCategory, PageLink } from '../types';
import { categoriesService } from '../services/categories';
import { subcategoriesService, SubCategoryPayload } from '../services/subcategories';
import { API_BASE_URL, getImageUrl } from '../services/api';
import { pageLinksService } from '../services/pageLinks';

const SubCategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pageLinks, setPageLinks] = useState<PageLink[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');

  const [subs, setSubs] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderDirty, setOrderDirty] = useState(false);
  const [showPassive, setShowPassive] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<SubCategory | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const currentCategory = useMemo(
    () => categories.find((c) => c.id == selectedCategoryId) || null,
    [categories, selectedCategoryId],
  );

  const loadCategories = async () => {
    setError(null);
    const cats = await categoriesService.list();
    setCategories(cats);
    if (cats.length && !selectedCategoryId) {
      setSelectedCategoryId(parseInt(cats[0].id, 10));
    }
  };

  const loadSubs = async (catId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await subcategoriesService.list(catId.toString());
      setSubs(res.sort((a, b) => (a.order || 0) - (b.order || 0)));
      setSelectedFile(null);
      setOrderDirty(false);
    } catch (err: any) {
      setError(err?.message || 'Alt kategoriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories().catch((e) => setError(e?.message || 'Kategoriler yüklenemedi'));
    pageLinksService.list().then(setPageLinks).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      loadSubs(selectedCategoryId);
    } else {
      setSubs([]);
    }
  }, [selectedCategoryId]);

  const handleAdd = () => {
    if (!selectedCategoryId) return;
    setEditingItem({
      id: '',
      categoryId: selectedCategoryId,
      title: '',
      description: '',
      imageUrl: '',
      order: (subs.length || 0) + 1,
      isActive: true,
    });
    setIsEditing(true);
    setSelectedFile(null);
  };

  const handleSave = async () => {
    if (!editingItem || !selectedCategoryId) return;
    setLoading(true);
    setError(null);
    try {
      const payload: SubCategoryPayload = {
        title: editingItem.title,
        description: editingItem.description,
        pageDesign: editingItem.pageDesign,
        order: editingItem.order,
        categoryId: editingItem.categoryId,
        isActive: editingItem.isActive,
      };
      if (editingItem.id) {
        const updated = await subcategoriesService.update(
          editingItem.id,
          payload,
          selectedFile || undefined
        );
        setSubs((prev) => prev.map((s) => (s.id === editingItem.id ? updated : s)));
      } else {
        const created = await subcategoriesService.create(
          payload,
          selectedFile || undefined
        );
        setSubs((prev) => [...prev, created]);
      }
      setIsEditing(false);
      setEditingItem(null);
      setSelectedFile(null);
      setOrderDirty(false);
    } catch (err: any) {
      setError(err?.message || 'Kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    setError(null);
    try {
      await subcategoriesService.update(id, { isActive: !currentStatus });
      if (selectedCategoryId) await loadSubs(selectedCategoryId);
    } catch (err: any) {
      setError(err?.message || 'Durum güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
    setLoading(true);
    setError(null);
    try {
      await subcategoriesService.remove(id);
      setSubs((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      setError(err?.message || 'Silinemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (dragIndex: number, dropIndex: number) => {
    if (dragIndex === dropIndex) return;
    const list = [...subs.filter((s) => s.categoryId == selectedCategoryId)];
    const [dragged] = list.splice(dragIndex, 1);
    list.splice(dropIndex, 0, dragged);
    const reordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    const others = subs.filter((s) => s.categoryId != selectedCategoryId);
    setSubs([...others, ...reordered]);
    setOrderDirty(true);
  };

  const handleSaveOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const current = subs
        .filter((s) => s.categoryId == selectedCategoryId)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      await Promise.all(
        current.map((s, idx) => subcategoriesService.update(s.id, { order: s.order ?? idx + 1, isActive: s.isActive })),
      );
      if (selectedCategoryId) await loadSubs(selectedCategoryId);
    } catch (err: any) {
      setError(err?.message || 'Sıralama kaydedilemedi');
    } finally {
      setLoading(false);
      setOrderDirty(false);
    }
  };

  const currentSubs = subs
    .filter((s) => s.categoryId == selectedCategoryId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const imageUrlToDisplay = useMemo(() => {
    if (selectedFile) {
      return URL.createObjectURL(selectedFile);
    }
    return getImageUrl(editingItem?.imageUrl);
  }, [selectedFile, editingItem?.imageUrl]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Alt Kategoriler</h1>
          <p className="text-sm text-gray-500">Kategoriye bağlı alt kategorileri yönetin.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori Seçin</label>
        <select
          value={selectedCategoryId}
          onChange={(e) => {
            setSelectedCategoryId(parseInt(e.target.value, 10));
            setIsEditing(false);
          }}
          className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-primary text-gray-700"
        >
          <option value="">Seçiniz...</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {selectedCategoryId && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="font-bold text-gray-700">
                {currentCategory?.title || 'Kategori'} - Alt Kategoriler
              </h3>
              <button
                onClick={() => setShowPassive(!showPassive)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${showPassive
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
              >
                {showPassive ? 'Pasifleri Gizle' : 'Pasifleri Göster'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveOrder}
                disabled={!orderDirty || loading}
                className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${orderDirty ? 'bg-primary text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-500'
                  }`}
              >
                Sıralamayı Kaydet
              </button>
              <button
                onClick={handleAdd}
                className="text-sm text-primary font-medium hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus size={16} /> Yeni Ekle
              </button>
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          {isEditing && editingItem ? (
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-800">
                  {editingItem.id ? 'Alt Kategori Düzenle' : 'Yeni Alt Kategori'}
                </h4>
                <button onClick={() => {
                  setIsEditing(false);
                  setSelectedFile(null);
                }} className="text-gray-400 hover:text-gray-600">
                  <XCircle size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ad</label>
                  <input
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Sayfa Tasarımı (Bağlantı)</label>
                  <select
                    value={editingItem.pageDesign || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, pageDesign: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-primary bg-white"
                  >
                    <option value="">Seçiniz...</option>
                    {pageLinks.map(link => (
                      <option key={link.id} value={link.slug}>{link.title} ({link.slug})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Açıklama</label>
                <input
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Sıra</label>
                  <input
                    type="number"
                    min={1}
                    value={editingItem.order}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, order: parseInt(e.target.value || '1', 10) })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-primary"
                  />
                  <div className="mt-4 flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editingItem.isActive}
                        onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                        className="w-4 h-4 text-primary rounded focus:ring-primary"
                      />
                      Aktif Alt Kategori
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Görsel</label>
                  {imageUrlToDisplay && (
                    <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <img src={imageUrlToDisplay} alt="Subcategory Image" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 cursor-pointer hover:border-primary">
                      <Upload size={16} />
                      <span>{selectedFile ? selectedFile.name : 'Dosya Seç'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setSelectedFile(file);
                        }}
                      />
                    </label>
                    {selectedFile && (
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => {
                  setIsEditing(false);
                  setSelectedFile(null);
                }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-primary text-white hover:bg-orange-600 rounded-lg disabled:opacity-60"
                >
                  Kaydet
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 w-10"></th>
                    <th className="px-4 py-3 w-24">Görsel</th>
                    <th className="px-4 py-3">Adı</th>
                    <th className="px-4 py-3">Açıklama</th>
                    <th className="px-4 py-3">Durum</th>
                    <th className="px-4 py-3 w-16 text-center">Sıra</th>
                    <th className="px-4 py-3 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentSubs.filter(s => showPassive || s.isActive).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                        Gösterilecek alt kategori bulunmuyor.
                      </td>
                    </tr>
                  ) : (
                    currentSubs.filter(s => showPassive || s.isActive).map((sub, index) => (
                      <tr
                        key={sub.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('index', index.toString())}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          const dragIndex = parseInt(e.dataTransfer.getData('index'));
                          handleDrop(dragIndex, index);
                        }}
                        className="hover:bg-gray-50 cursor-move group"
                      >
                        <td className="px-4 py-3 text-gray-400">
                          <GripVertical size={16} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-12 h-10 bg-gray-100 rounded-lg overflow-hidden">
                            {sub.imageUrl ? (
                              <img src={getImageUrl(sub.imageUrl)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">IMG</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">{sub.title}</td>
                        <td className="px-4 py-3 text-gray-500">{sub.description}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sub.isActive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                            {sub.isActive ? 'AKTİF' : 'PASİF'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700">{sub.order ?? index + 1}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => toggleStatus(sub.id, sub.isActive)}
                              className={`p-1.5 rounded transition-colors ${sub.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                              title={sub.isActive ? 'Pasife Al' : 'Aktife Al'}
                            >
                              {sub.isActive ? <CheckCircle size={18} /> : <XCircle size={18} />}
                            </button>
                            <button
                              onClick={() => {
                                setEditingItem(sub);
                                setIsEditing(true);
                              }}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(sub.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {currentSubs.length > 0 && (
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1 px-4 py-2">
                  <GripVertical size={12} /> Sürükle-bırak ile sıralayıp, “Sıralamayı Kaydet” ile DB’ye yazın.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubCategoryManager;
