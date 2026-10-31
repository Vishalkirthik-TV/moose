export type ProviderId = 'zai' | 'openrouter';

export interface ProviderModel {
    id: string;
    name: string;
    supportsReasoning: boolean;
    isFree?: boolean;
}

export interface ProviderStatus {
    zai: boolean;
    openrouter: boolean;
}

export const DEFAULT_MODELS: Record<ProviderId, string> = {
    zai: 'glm-4.7-flash',
    openrouter: '',
};
