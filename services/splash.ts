import { api } from './api';
import { SplashConfig } from '../types';

export const splashService = {
    get: () => api.get<SplashConfig>('/splash'),
    update: (data: FormData) => api.put<SplashConfig>('/splash', data),
};
