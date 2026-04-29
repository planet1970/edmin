import { useState, useCallback, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

interface UseCrudOptions<T> {
  endpoint: string;
  onSuccess?: (data: T[]) => void;
  onError?: (error: any) => void;
}

export function useCrud<T>({ endpoint, onSuccess, onError }: UseCrudOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Use refs for callbacks to prevent infinite loops when passed inline
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const fetchData = useCallback(async (params?: any) => {
    setLoading(true);
    try {
      const response = await api.get<T[]>(endpoint, { params });
      setData(response);
      onSuccessRef.current?.(response);
    } catch (error: any) {
      // api.ts already shows toast for common errors, but we can keep this for safety
      onErrorRef.current?.(error);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const createItem = async (item: Partial<T> | FormData) => {
    setSaving(true);
    try {
      const isFormData = item instanceof FormData;
      const response = await api.post(endpoint, item, isFormData ? {
        headers: { 'Content-Type': 'multipart/form-data' }
      } : undefined);
      toast.success('Başarıyla eklendi.');
      await fetchData();
      return response;
    } catch (error: any) {
      toast.error('Ekleme sırasında bir hata oluştu.');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const updateItem = async (id: string | number, item: Partial<T> | FormData) => {
    setSaving(true);
    try {
      const isFormData = item instanceof FormData;
      const response = await api.patch(`${endpoint}/${id}`, item, isFormData ? {
        headers: { 'Content-Type': 'multipart/form-data' }
      } : undefined);
      toast.success('Başarıyla güncellendi.');
      await fetchData();
      return response;
    } catch (error: any) {
      toast.error('Güncelleme sırasında bir hata oluştu.');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string | number) => {
    if (!window.confirm('Bu öğeyi silmek istediğinizden emin misiniz?')) return;
    setLoading(true);
    try {
      await api.delete(`${endpoint}/${id}`);
      toast.success('Başarıyla silindi.');
      await fetchData();
    } catch (error: any) {
      toast.error('Silme sırasında bir hata oluştu.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string | number, currentStatus: boolean, field: string = 'isActive') => {
    try {
      await api.patch(`${endpoint}/${id}`, { [field]: !currentStatus });
      await fetchData();
    } catch (error: any) {
      toast.error('Durum güncellenirken bir hata oluştu.');
    }
  };

  const reorderItems = async (ids: (string | number)[]) => {
    try {
      await api.post(`${endpoint}/reorder`, { ids });
      toast.success('Sıralama güncellendi.');
      await fetchData();
    } catch (error: any) {
      toast.error('Sıralama güncellenirken bir hata oluştu.');
    }
  };

  return {
    data,
    loading,
    saving,
    fetchData,
    createItem,
    updateItem,
    deleteItem,
    toggleStatus,
    reorderItems,
    setData
  };
}
