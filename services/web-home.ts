import { api } from './api';

export interface WebHeroSlide {
    id: string;
    title?: string;
    subtitle?: string;
    description?: string;
    imageUrl?: string;
    order: number;
    titleColor?: string;
    subtitleColor?: string;
    descriptionColor?: string;
    titleShadowColor?: string;
    createdAt: string;
}

export interface WebSocialInfo {
    id: number;
    phone?: string;
    email?: string;
    address?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
}

export interface WebNavbar {
    id: number;
    logoUrl?: string;
    title?: string;
    titleColor?: string;
    fontFamily?: string;
    fontSize?: number;
    bgColor?: string;
    iconColor?: string;
}

export interface WebAboutSection {
    id: number;
    title?: string;
    description?: string;
    cards?: WebAboutCard[];
}

export interface WebAboutCard {
    id: number;
    icon?: string;
    title?: string;
    summary?: string;
    content?: string;
    order: number;
    isActive: boolean;
}

export const webHomeService = {
    // Hero
    findAllHero: async () => {
        return api.get<WebHeroSlide[]>('/web-home/hero');
    },

    createHero: async (data: FormData) => {
        return api.post<WebHeroSlide>('/web-home/hero', data);
    },

    updateHero: async (id: string, data: FormData) => {
        return api.patch<WebHeroSlide>(`/web-home/hero/${id}`, data);
    },

    removeHero: async (id: string) => {
        return api.delete(`/web-home/hero/${id}`);
    },

    // Social
    getSocialInfo: async () => {
        return api.get<WebSocialInfo>('/web-home/social');
    },

    updateSocialInfo: async (data: Partial<WebSocialInfo>) => {
        return api.post<WebSocialInfo>('/web-home/social', data);
    },

    // Navbar
    getNavbar: async () => {
        return api.get<WebNavbar>('/web-home/navbar');
    },

    updateNavbar: async (data: FormData) => {
        return api.post<WebNavbar>('/web-home/navbar', data);
    },

    // About
    getAboutSection: async () => {
        return api.get<WebAboutSection>('/web-home/about');
    },

    updateAboutSection: async (data: Partial<WebAboutSection>) => {
        return api.post<WebAboutSection>('/web-home/about', data);
    },

    createAboutCard: async (data: Partial<WebAboutCard>) => {
        return api.post<WebAboutCard>('/web-home/about/cards', data);
    },

    updateAboutCard: async (id: number, data: Partial<WebAboutCard>) => {
        return api.patch<WebAboutCard>(`/web-home/about/cards/${id}`, data);
    },

    removeAboutCard: async (id: number) => {
        return api.delete(`/web-home/about/cards/${id}`);
    },

    reorderAboutCards: async (ids: number[]) => {
        return api.post('/web-home/about/cards/reorder', ids);
    },
};
