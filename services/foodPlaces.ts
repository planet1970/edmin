import { api } from './api';
import { FoodPlace } from '../types';

export type FoodPlacePayload = Omit<FoodPlace, 'id' | 'createdAt' | 'updatedAt'>;

const basePath = "/food-places";

export const foodPlacesService = {
    list: async (subCategoryId?: number): Promise<FoodPlace[]> => {
        const query = subCategoryId ? `?subCategoryId=${subCategoryId}` : '';
        return api.get<FoodPlace[]>(`${basePath}${query}`);
    },
    get: async (id: number): Promise<FoodPlace> => {
        return api.get<FoodPlace>(`${basePath}/${id}`);
    },
    create: async (payload: FoodPlacePayload, file?: File, backFile?: File): Promise<FoodPlace> => {
        const formData = new FormData();
        Object.keys(payload).forEach(key => {
            const val = (payload as any)[key];
            if (val !== undefined && val !== null && typeof val !== 'object') {
                formData.append(key, String(val));
            }
        });
        if (file) formData.append('file', file);
        if (backFile) formData.append('back_file', backFile);

        return api.post<FoodPlace>(basePath, formData);
    },
    update: async (id: number, payload: Partial<FoodPlacePayload>, file?: File, backFile?: File): Promise<FoodPlace> => {
        const formData = new FormData();
        Object.keys(payload).forEach(key => {
            const val = (payload as any)[key];
            if (val !== undefined && val !== null && typeof val !== 'object') {
                formData.append(key, String(val));
            }
        });
        if (file) formData.append('file', file);
        if (backFile) formData.append('back_file', backFile);

        return api.patch<FoodPlace>(`${basePath}/${id}`, formData);
    },
    remove: async (id: number): Promise<void> => {
        return api.delete<void>(`${basePath}/${id}`);
    },
};
