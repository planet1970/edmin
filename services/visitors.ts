import { api } from './api';
import { Visitor } from '../types';

export const visitorService = {
    getAll: () => api.get<Visitor[]>('/visitors'),
};
