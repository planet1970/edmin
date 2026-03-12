import { api } from './api';

export interface CloudinaryResource {
    public_id: string;
    format: string;
    version: number;
    resource_type: string;
    type: string;
    created_at: string;
    bytes: number;
    width: number;
    height: number;
    url: string;
    secure_url: string;
}

export interface CloudinaryListResponse {
    resources: CloudinaryResource[];
    next_cursor?: string;
}

export interface CloudinaryUsageResponse {
    limit: number;
    used: number;
    request_count: number;
    resources: number;
    objects: number;
    bandwidth: {
        limit: number;
        used: number;
    };
    storage: {
        limit: number;
        used: number;
    };
}

export const mediaService = {
    list: () => api.get<CloudinaryListResponse>('/media/list'),
    getStats: () => api.get<CloudinaryUsageResponse>('/media/stats'),
    delete: (publicId: string) => api.delete(`/media/${encodeURIComponent(publicId)}`),
};
