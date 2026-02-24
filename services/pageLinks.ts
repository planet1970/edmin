import { api } from './api';
import { PageLink } from '../types';

export interface PageLinkPayload {
    title: string;
    description?: string;
    slug: string;
    targetTable?: string;
}

const basePath = '/page-links';

export const pageLinksService = {
    list: () => api.get<PageLink[]>(basePath),
    create: (payload: PageLinkPayload) => api.post<PageLink>(basePath, payload),
    update: (id: number, payload: Partial<PageLinkPayload>) => api.patch<PageLink>(`${basePath}/${id}`, payload),
    remove: (id: number) => api.delete<void>(`${basePath}/${id}`),
};
