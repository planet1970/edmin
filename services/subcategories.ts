import { api } from './api';
import { SubCategory } from '../types';

export interface SubCategoryPayload {
  title: string;
  description?: string;
  imageUrl?: string;
  pageDesign?: string;
  order?: number;
  categoryId: number;
  isActive?: boolean;
}

const basePath = "/subcategories";

export const subcategoriesService = {
  list: async (categoryId?: string): Promise<SubCategory[]> => {
    const query = categoryId ? `?categoryId=${categoryId}` : "";
    return api.get<SubCategory[]>(`${basePath}${query}`);
  },
  create: async (
    payload: SubCategoryPayload,
    file?: File
  ): Promise<SubCategory> => {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("categoryId", payload.categoryId.toString());
    if (payload.description) {
      formData.append("description", payload.description);
    }
    if (payload.pageDesign) {
      formData.append("pageDesign", payload.pageDesign);
    }
    if (payload.order) {
      formData.append("order", payload.order.toString());
    }
    if (payload.isActive !== undefined) {
      formData.append("isActive", payload.isActive.toString());
    }
    if (file) {
      formData.append("file", file);
    }

    return api.post<SubCategory>(basePath, formData);
  },
  update: async (
    id: string,
    payload: Partial<SubCategoryPayload>,
    file?: File
  ): Promise<SubCategory> => {
    const formData = new FormData();
    if (payload.title) {
      formData.append("title", payload.title);
    }
    if (payload.categoryId) {
      formData.append("categoryId", payload.categoryId.toString());
    }
    if (payload.description) {
      formData.append("description", payload.description);
    }
    if (payload.pageDesign) {
      formData.append("pageDesign", payload.pageDesign);
    }
    if (payload.order) {
      formData.append("order", payload.order.toString());
    }
    if (payload.isActive !== undefined) {
      formData.append("isActive", payload.isActive.toString());
    }
    if (file) {
      formData.append("file", file);
    }

    return api.patch<SubCategory>(`${basePath}/${id}`, formData);
  },
  remove: async (id: string): Promise<void> => {
    return api.delete<void>(`${basePath}/${id}`);
  },
};
