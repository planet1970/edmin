import { api } from "./api";
import { PageDefinition } from "../types";

export type PageDefinitionPayload = Omit<PageDefinition, 'id' | 'createdAt' | 'updatedAt'>;

const basePath = "/page-definitions";

export const pageDefinitionsService = {
    list: async (): Promise<PageDefinition[]> => {
        return api.get<PageDefinition[]>(basePath);
    },
    get: async (id: string): Promise<PageDefinition> => {
        return api.get<PageDefinition>(`${basePath}/${id}`);
    },
    create: async (
        payload: PageDefinitionPayload
    ): Promise<PageDefinition> => {
        return api.post<PageDefinition>(basePath, payload);
    },
    update: async (
        id: string,
        payload: Partial<PageDefinitionPayload>
    ): Promise<PageDefinition> => {
        return api.patch<PageDefinition>(`${basePath}/${id}`, payload);
    },
    remove: async (id: string): Promise<void> => {
        return api.delete<void>(`${basePath}/${id}`);
    },
};

export const fetchPageDefinitions = async (): Promise<PageDefinition[]> => {
    const response = await pageDefinitionsService.list();
    return response;
};

export const fetchPageDefinitionById = async (id: string): Promise<PageDefinition> => {
    const response = await pageDefinitionsService.get(id);
    return response;
};
