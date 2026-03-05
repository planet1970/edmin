
import { API_URL } from './api';

export const tempPagesService = {
    savePlaceDraft: async (userId: number | string, data: any) => {
        const response = await fetch(`${API_URL}/temp-pages/place/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    saveFoodPlaceDraft: async (userId: number | string, data: any) => {
        const response = await fetch(`${API_URL}/temp-pages/food-place/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    getMyDrafts: async (userId: number | string) => {
        const response = await fetch(`${API_URL}/temp-pages/my-drafts/${userId}`);
        return response.json();
    },

    deleteDraft: async (pageType: string, id: number) => {
        const response = await fetch(`${API_URL}/temp-pages/${pageType}/${id}`, {
            method: 'DELETE'
        });
        return response.json();
    },

    getAllDrafts: async () => {
        const response = await fetch(`${API_URL}/temp-pages/all`);
        return response.json();
    },

    approveDraft: async (pageType: string, id: number) => {
        const response = await fetch(`${API_URL}/temp-pages/approve/${pageType}/${id}`, {
            method: 'PATCH'
        });
        return response.json();
    }
};
