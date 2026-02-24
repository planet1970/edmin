import { api } from './api';
import { Category } from '../types';

export interface CategoryPayload {
  title: string;
  description?: string;
  iconName?: string;
  webIcon?: string;
  order?: number;
  isActive?: boolean;
}

const mapApiToCategory = (c: any): Category => ({
  id: String(c.id),
  title: c.title,
  description: c.description || '',
  iconName: c.iconName || 'Home',
  webIcon: c.webIcon || 'fas fa-map-marked-alt',
  order: c.order ?? 1,
  isActive: c.isActive ?? true,
});

export const categoriesService = {
  list: async (): Promise<Category[]> => {
    const res = await api.get<any[]>('/categories');
    return res.map(mapApiToCategory);
  },
  create: async (payload: CategoryPayload): Promise<Category> => {
    const res = await api.post<any>('/categories', payload);
    return mapApiToCategory(res);
  },
  update: async (id: string, payload: Partial<CategoryPayload>): Promise<Category> => {
    const res = await api.put<any>(`/categories/${id}`, payload);
    return mapApiToCategory(res);
  },
  remove: async (id: string): Promise<void> => {
    await api.delete<void>(`/categories/${id}`);
  },
};
