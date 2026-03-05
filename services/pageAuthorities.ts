
import { api } from './api';

export interface PageAuthority {
    id: number;
    userId: number;
    user: {
        id: number;
        name: string;
        email: string;
        imageUrl?: string;
    };
    sourceType: string;
    sourceId: number;
    createdAt: string;
}

export interface AssignedCustomer {
    id: number;
    userId: number;
    userName: string;
    pageId: number;
    pageType: string;
    pageTitle: string;
    categoryId: number | null;
    subCategoryId: number | null;
}

const basePath = "/page-authorities";

export const pageAuthoritiesService = {
    getAuthorities: async (type: string, id: number): Promise<PageAuthority[]> => {
        return api.get<PageAuthority[]>(`${basePath}/${type}/${id}`);
    },
    addAuthority: async (sourceType: string, sourceId: number, userId: number): Promise<PageAuthority> => {
        return api.post<PageAuthority>(basePath, { sourceType, sourceId, userId });
    },
    removeAuthority: async (id: number): Promise<void> => {
        return api.delete<void>(`${basePath}/${id}`);
    },
    getCustomers: async (): Promise<any[]> => {
        return api.get<any[]>(`${basePath}/customers`);
    },
    getAssignedCustomers: async (): Promise<AssignedCustomer[]> => {
        return api.get<AssignedCustomer[]>(`${basePath}/assigned-customers`);
    }
};
