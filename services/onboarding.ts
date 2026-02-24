import { api } from './api';
import { OnboardingStep } from '../types';

export const onboardingService = {
    getAll: () => api.get<OnboardingStep[]>('/onboarding'),
    create: (data: FormData) => api.post<OnboardingStep>('/onboarding', data),
    update: (id: number, data: FormData) => api.put<OnboardingStep>(`/onboarding/${id}`, data),
    delete: (id: number) => api.delete<void>(`/onboarding/${id}`),
};
