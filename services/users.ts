import { api } from './api';
import { User } from '../types';

export const userService = {
    getAll: () => api.get<User[]>('/users'),
    delete: (id: string | number) => api.delete<void>(`/users/${id}`),
    update: (id: string | number, data: any) => api.patch<User>(`/users/${id}`, data),

    // UserType APIs
    getTypes: () => api.get<any[]>('/users/types'),
    createType: (data: any) => api.post<any>('/users/types', data),
    deleteType: (id: string) => api.delete<void>(`/users/types/${id}`),
};
