import { api } from './api';
import { PagePlan } from '../types';

export type PagePlanPayload = Omit<PagePlan, 'id' | 'createdAt' | 'updatedAt' | 'category' | 'subCategory'>;

const basePath = "/page-plans";

export const pagePlansService = {
    list: async (): Promise<PagePlan[]> => {
        return api.get<PagePlan[]>(basePath);
    },
    get: async (id: string): Promise<PagePlan> => {
        return api.get<PagePlan>(`${basePath}/${id}`);
    },
    create: async (
        payload: PagePlanPayload
    ): Promise<PagePlan> => {
        return api.post<PagePlan>(basePath, payload);
    },
    update: async (
        id: string,
        payload: Partial<PagePlanPayload>
    ): Promise<PagePlan> => {
        return api.patch<PagePlan>(`${basePath}/${id}`, payload);
    },
    remove: async (id: string): Promise<void> => {
        return api.delete<void>(`${basePath}/${id}`);
    },
};
