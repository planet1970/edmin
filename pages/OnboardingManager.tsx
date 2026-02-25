import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, GripVertical, Image as ImageIcon, Save } from 'lucide-react';
import { OnboardingStep } from '../types';
import { onboardingService } from '../services/onboarding';
import { API_BASE_URL, getImageUrl } from '../services/api';
import IconPicker from '../components/IconPicker';

const OnboardingManager: React.FC = () => {
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [activeStepId, setActiveStepId] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Local state for the form
  const [formData, setFormData] = useState<Partial<OnboardingStep>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSteps();
  }, []);

  const loadSteps = async () => {
    try {
      const data = await onboardingService.getAll();
      setSteps(data);
      if (data.length > 0 && !activeStepId) {
        selectStep(data[0]);
      } else if (data.length === 0) {
        setActiveStepId(null);
        setFormData({});
      }
    } catch (error) {
      console.error('Error loading onboarding steps:', error);
    }
  };

  const selectStep = (step: OnboardingStep) => {
    setActiveStepId(step.id);
    setFormData({ ...step });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleAddStep = () => {
    const newStep = {
      title: 'Yeni Adım',
      description: '',
      order: steps.length + 1,
    };
    setActiveStepId(-1); // -1 indicates creating new
    setFormData(newStep);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleDeleteStep = async (id: number) => {
    if (!confirm('Bu adımı silmek istediğinize emin misiniz?')) return;
    try {
      await onboardingService.delete(id);
      loadSteps();
      if (activeStepId === id) {
        setActiveStepId(null);
        setFormData({});
      }
    } catch (error) {
      console.error('Error deleting step:', error);
      alert('Silinemedi');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      const data = new FormData();
      data.append('title', formData.title || '');
      data.append('description', formData.description || '');
      data.append('icon', formData.icon || 'Map');
      data.append('order', (formData.order || steps.length + 1).toString());

      if (selectedFile) {
        data.append('file', selectedFile);
      } else if (formData.imageUrl) {
        // Keep existing image if not changed (implied by not sending 'file')
      }

      if (activeStepId === -1) {
        await onboardingService.create(data);
      } else if (activeStepId) {
        await onboardingService.update(activeStepId, data);
      }

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      loadSteps();
    } catch (error) {
      console.error('Error saving step:', error);
      alert('Hata oluştu');
    }
  };

  const displayImageUrl = previewUrl || getImageUrl(formData.imageUrl);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Onboarding Yönetimi</h1>
          <p className="text-sm text-gray-500">Kullanıcı karşılama ekranlarını düzenleyin.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl">

        {/* Step List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-bold text-gray-700">Adımlar ({steps.length})</h2>
            <button
              onClick={handleAddStep}
              className="flex items-center gap-1 text-sm text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={16} /> Yeni Ekle
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors ${activeStepId === step.id ? 'bg-orange-50 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
                onClick={() => selectStep(step)}
              >
                <div className="text-gray-400 cursor-grab">
                  <GripVertical size={20} />
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {step.imageUrl ? (
                    <img src={getImageUrl(step.imageUrl)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={16} /></div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 text-sm">{step.title}</h3>
                  <p className="text-xs text-gray-500 truncate">{step.description}</p>
                </div>
                <div className="text-xs font-bold text-gray-300 bg-gray-100 px-2 py-1 rounded">
                  {step.order}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteStep(step.id); }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {activeStepId === -1 && (
              <div className="p-4 flex items-center gap-4 bg-orange-50 border-l-4 border-primary">
                <span className="text-sm font-medium">Yeni Adım Oluşturuluyor...</span>
              </div>
            )}
          </div>
        </div>

        {/* Editor for Active Step */}
        {(activeStepId !== null) && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-fadeIn h-fit">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                {activeStepId === -1 ? '+' : steps.findIndex(s => s.id === activeStepId) + 1}
              </span>
              {activeStepId === -1 ? 'Yeni Adım' : 'Adım Düzenle'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İkon</label>
                <IconPicker
                  selectedIcon={formData.icon || 'Map'}
                  onSelect={(icon) => setFormData({ ...formData, icon })}
                  label=""
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sıra</label>
                <input
                  type="number"
                  value={formData.order || 0}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Görsel</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-primary transition-colors h-48"
                >
                  {displayImageUrl ? (
                    <img src={displayImageUrl} alt="Preview" className="h-full object-contain" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon size={32} className="mx-auto mb-2" />
                      <span className="text-sm">Görsel yüklemek için tıklayın</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t mt-4">
                <button
                  onClick={handleSave}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  <Save size={20} /> Kaydet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-bottom-5 fade-in duration-300 z-50 flex items-center gap-2">
          <Save size={18} />
          <span>Değişiklikler başarıyla kaydedildi!</span>
        </div>
      )}
    </div>
  );
};

export default OnboardingManager;
