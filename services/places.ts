import { api } from './api';
import { Place } from '../types';

export type PlacePayload = Omit<Place, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>;

const basePath = "/places";

export const placesService = {
    list: async (subCategoryId?: string): Promise<Place[]> => {
        const query = subCategoryId ? `?subCategoryId=${subCategoryId}` : "";
        return api.get<Place[]>(`${basePath}${query}`);
    },
    get: async (id: string): Promise<Place> => {
        return api.get<Place>(`${basePath}/${id}`);
    },
    create: async (
        payload: PlacePayload,
        file?: File,
        backFile?: File
    ): Promise<Place> => {
        const formData = new FormData();

        Object.keys(payload).forEach(key => {
            const value = payload[key as keyof PlacePayload];
            if (value !== null && value !== undefined) {
                if (typeof value === 'boolean') {
                    formData.append(key, String(value));
                } else if (typeof value === 'number') {
                    formData.append(key, String(value));
                } else {
                    formData.append(key, value as string);
                }
            }
        });

        if (file) {
            formData.append("file", file);
        }
        if (backFile) {
            formData.append("back_file", backFile);
        }

        return api.post<Place>(basePath, formData);
    },
    update: async (
        id: string,
        payload: Partial<PlacePayload>,
        file?: File,
        backFile?: File
    ): Promise<Place> => {
        const formData = new FormData();

        Object.keys(payload).forEach(key => {
            const value = payload[key as keyof PlacePayload];
            if (value !== null && value !== undefined) {
                if (typeof value === 'boolean') {
                    formData.append(key, String(value));
                } else if (typeof value === 'number') {
                    formData.append(key, String(value));
                } else {
                    formData.append(key, value as string);
                }
            }
        });

        if (file) {
            formData.append("file", file);
        }
        if (backFile) {
            formData.append("back_file", backFile);
        }

        return api.patch<Place>(`${basePath}/${id}`, formData);
    },
    remove: async (id: string): Promise<void> => {
        return api.delete<void>(`${basePath}/${id}`);
    },
};
