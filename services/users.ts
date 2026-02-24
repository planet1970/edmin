import { api } from './api';
import { User } from '../types';

export const userService = {
    getAll: () => api.get<User[]>('/users'),
    delete: (id: string | number) => api.delete<void>(`/users/${id}`),
    update: (id: string | number, data: any) => api.patch<User>(`/users/${id}`, data),
};
