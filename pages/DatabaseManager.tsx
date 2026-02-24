import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, XCircle, Database, Type, Key, AlignLeft, AlertCircle } from 'lucide-react';
import { DbDefinition, DbField, FieldType } from '../types';

const STORAGE_KEY = 'ems_db_defs';

const DatabaseManager: React.FC = () => {
  const [databases, setDatabases] = useState<DbDefinition[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingDb, setEditingDb] = useState<DbDefinition | null>(null);

  // Load Data and Initialize Mock Data
  useEffect(() => {
    // Mock Data Initialization (Always apply this for demonstration, overwriting localStorage)
    const mocks: DbDefinition[] = [
      {
        id: '1',
        title: 'Mekanlar DB',
        description: 'Şehir rehberindeki mekanların ana tablosu',
        fields: [
          { id: 'f1', name: 'Başlık', key: 'title', type: 'text' },
          { id: 'f2', name: 'Slug', key: 'slug', type: 'text' },
          { id: 'f3', name: 'Resim', key: 'pic_url', type: 'text' },
          { id: 'f4', name: 'Kart1-İkon', key: 'icon1', type: 'text' },
          { id: 'f5', name: 'Kart1-Başlık', key: 'title1', type: 'text' },
          { id: 'f6', name: 'Kart1-Info', key: 'info1', type: 'text' },
          { id: 'f7', name: 'Kart2-İkon', key: 'icon2', type: 'text' },
          { id: 'f8', name: 'Kart2-Başlık', key: 'title2', type: 'text' },
          { id: 'f9', name: 'Kart2-Info', key: 'info2', type: 'text' },
          { id: 'f10', name: 'Kart3-İkon', key: 'icon3', type: 'text' },
          { id: 'f11', name: 'Kart3-Başlık', key: 'title3', type: 'text' },
          { id: 'f12', name: 'Kart3-Info', key: 'info3', type: 'text' },
          { id: 'f13', name: 'Kart4-İkon', key: 'icon4', type: 'text' },
          { id: 'f14', name: 'Kart4-Başlık', key: 'title4', type: 'text' },
          { id: 'f15', name: 'Kart4-Info', key: 'info4', type: 'text' },
          { id: 'f16', name: 'Ön Sayfa', key: 'description', type: 'long-text' },
          { id: 'f17', name: 'Puan', key: 'rating', type: 'number' },
          { id: 'f18', name: 'Panel1-Başlık', key: 'panel1_title', type: 'text' },
          { id: 'f19', name: 'Panel-1', key: 'panel1', type: 'text' },
          { id: 'f20', name: 'Panel2-Başlık', key: 'panel2_title', type: 'text' },
          { id: 'f21', name: 'Panel-2', key: 'panel2', type: 'text' },
          { id: 'f22', name: 'Panel Özel Başlık', key: 'panel_col_title', type: 'text' },
          { id: 'f23', name: 'Panel Özel', key: 'panel_col', type: 'text' },
          { id: 'f24', name: 'Panel3-Başlık', key: 'panel3_title', type: 'text' },
          { id: 'f25', name: 'Panel-3', key: 'panel3', type: 'text' },
          { id: 'f26', name: 'Panel4-Başlık', key: 'panel4_title', type: 'text' },
          { id: 'f27', name: 'Panel-4', key: 'panel4', type: 'text' },
          { id: 'f28', name: 'Panel Özel2 Başlık', key: 'panel_col_title2', type: 'text' },
          { id: 'f29', name: 'Panel Özel2', key: 'panel_col2', type: 'text' },
          { id: 'f30', name: 'Panel5-Başlık', key: 'panel5_title', type: 'text' },
          { id: 'f31', name: 'Panel-5', key: 'panel5', type: 'text' },
          { id: 'f32', name: 'Ek Alan1', key: 'area1', type: 'text' },
          { id: 'f33', name: 'Ek Alan2', key: 'area2', type: 'text' },
          { id: 'f34', name: 'Ek Alan3', key: 'area3', type: 'text' },
          { id: 'f35', name: 'Ek Alan4', key: 'area4', type: 'text' },
          { id: 'f36', name: 'Ek Alan5', key: 'area5', type: 'text' },
          { id: 'f37', name: 'Ek Alan6', key: 'area6', type: 'text' },
          { id: 'f38', name: 'Ek Alan7', key: 'area7', type: 'text' },
          { id: 'f39', name: 'Ek Alan8', key: 'area8', type: 'text' },
          { id: 'f40', name: 'Ek Alan9', key: 'area9', type: 'text' },
          { id: 'f41', name: 'Ek Alan10', key: 'area10', type: 'text' },
          { id: 'f42', name: 'Kaynak', key: 'source', type: 'text' },
        ]
      },
      {
        id: '2',
        title: 'Etkinlikler DB',
        description: 'Konserler ve festivaller',
        fields: [
          { id: 'e1', name: 'Etkinlik Adı', key: 'event_name', type: 'text' },
          { id: 'e2', name: 'Tarih', key: 'event_date', type: 'date' },
          { id: 'e3', name: 'Bilet Fiyatı', key: 'price', type: 'number' }
        ]
      }
    ];
    setDatabases(mocks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mocks));
  }, []);

  // Save Data
  useEffect(() => {
    if (databases.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(databases));
    }
  }, [databases]);

  // --- ACTIONS ---
  const handleCreateNew = () => {
    setEditingDb({
      id: '',
      title: '',
      description: '',
      fields: []
    });
    setIsEditing(true);
  };

  const handleEdit = (db: DbDefinition) => {
    setEditingDb(JSON.parse(JSON.stringify(db)));
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu veritabanı tanımını silmek istediğinize emin misiniz?')) {
      const newDbs = databases.filter(d => d.id !== id);
      setDatabases(newDbs);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newDbs));
    }
  };

  const handleSave = () => {
    if (!editingDb) return;
    if (!editingDb.title) {
      alert('Lütfen database adını giriniz.');
      return;
    }

    if (editingDb.id) {
      setDatabases(prev => prev.map(d => d.id === editingDb.id ? editingDb : d));
    } else {
      const newDb = { ...editingDb, id: Date.now().toString() };
      setDatabases([...databases, newDb]);
    }
    setIsEditing(false);
    setEditingDb(null);
  };

  // --- FIELD ACTIONS ---
  const addField = () => {
    if (!editingDb) return;
    const newField: DbField = {
      id: Date.now().toString(),
      name: '',
      key: '',
      type: 'text'
    };
    setEditingDb({
      ...editingDb,
      fields: [...editingDb.fields, newField]
    });
  };

  const updateField = (index: number, key: keyof DbField, value: string) => {
    if (!editingDb) return;
    const updatedFields = [...editingDb.fields];
    // @ts-ignore
    updatedFields[index] = { ...updatedFields[index], [key]: value };
    setEditingDb({ ...editingDb, fields: updatedFields });
  };

  const removeField = (index: number) => {
    if (!editingDb) return;
    const updatedFields = editingDb.fields.filter((_, idx) => idx !== index);
    setEditingDb({ ...editingDb, fields: updatedFields });
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Database Tanım</h1>
          <p className="text-sm text-gray-500">Veritabanı tablolarını ve alanlarını tanımlayın.</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
          >
            <Plus size={18} /> Yeni Database Ekle
          </button>
        )}
      </div>

      {isEditing && editingDb ? (
        <div className="w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100 animate-fadeIn">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-lg font-bold text-gray-800">
              {editingDb.id ? 'Database Düzenle' : 'Yeni Database Tanımı'}
            </h2>
            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
              <XCircle size={24} />
            </button>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Database Adı</label>
                <input
                  type="text"
                  value={editingDb.title}
                  onChange={(e) => setEditingDb({ ...editingDb, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-primary"
                  placeholder="Örn: Mekanlar DB"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <input
                  type="text"
                  value={editingDb.description}
                  onChange={(e) => setEditingDb({ ...editingDb, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-primary"
                  placeholder="Kullanım amacı..."
                />
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <Database size={20} className="text-primary" />
                  Tablo Alanları
                </h3>
                <button
                  onClick={addField}
                  className="flex items-center gap-1 text-sm text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus size={16} /> Alan Ekle
                </button>
              </div>

              {editingDb.fields.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl bg-white">
                  Henüz alan eklenmedi.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-4 px-3 text-xs font-bold text-gray-400 uppercase mb-2">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-4">Alan Adı (Label)</div>
                    <div className="col-span-4">Database Adı (Key)</div>
                    <div className="col-span-2">Veri Tipi</div>
                    <div className="col-span-1"></div>
                  </div>
                  {editingDb.fields.map((field, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-center bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                      <div className="col-span-1 text-center text-gray-400 font-mono text-xs">{index + 1}</div>

                      <div className="col-span-4">
                        <div className="relative">
                          <AlignLeft size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => updateField(index, 'name', e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-primary"
                            placeholder="Örn: Mekan Adı"
                          />
                        </div>
                      </div>

                      <div className="col-span-4">
                        <div className="relative">
                          <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={field.key}
                            onChange={(e) => updateField(index, 'key', e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-primary font-mono text-xs"
                            placeholder="Örn: place_name"
                          />
                        </div>
                      </div>

                      <div className="col-span-2">
                        <div className="relative">
                          <Type size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <select
                            value={field.type}
                            onChange={(e) => updateField(index, 'type', e.target.value as FieldType)}
                            className="w-full pl-9 pr-2 py-2 border border-gray-200 rounded text-sm focus:outline-primary bg-white cursor-pointer"
                          >
                            <option value="text">Metin</option>
                            <option value="long-text">Uzun Metin</option>
                            <option value="number">Sayı</option>
                            <option value="date">Tarih</option>
                            <option value="time">Saat</option>
                            <option value="boolean">Doğru/Yanlış</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => removeField(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100">
              <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg mr-2 font-medium">İptal</button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-8 py-2.5 rounded-lg transition-colors font-medium shadow-md shadow-orange-200"
              >
                <Save size={18} /> Kaydet
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {databases.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-400">
              Tanımlı database bulunamadı.
            </div>
          ) : (
            databases.map(db => (
              <div key={db.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{db.title}</h3>
                    <p className="text-sm text-gray-500">{db.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(db)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(db.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-bold text-gray-500 uppercase mb-2">Alanlar ({db.fields.length})</div>
                  <div className="space-y-1">
                    {db.fields.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-600">
                        <span>{f.name}</span>
                        <span className="font-mono text-gray-400">{f.key}</span>
                      </div>
                    ))}
                    {db.fields.length > 3 && (
                      <div className="text-xs text-center text-primary pt-1">+ {db.fields.length - 3} daha</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      <div className="mt-8 flex items-center gap-2 text-xs text-gray-400">
        <AlertCircle size={14} />
        <span>Bu sayfadaki veriler tarayıcınızın yerel hafızasında (localStorage) saklanmaktadır.</span>
      </div>
    </div>
  );
};

export default DatabaseManager;
