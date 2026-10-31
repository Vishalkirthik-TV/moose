import { useAuth } from '@clerk/clerk-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchProviderModels, fetchProviderStatus } from '@/lib/api';
import type { ProviderModel, ProviderStatus } from '@/lib/providers';
import { useChatStore } from '@/lib/store';

export function useProviderModels() {
    const { getToken, isLoaded } = useAuth();
    const providerId = useChatStore((state) => state.providerId);
    const modelId = useChatStore((state) => state.modelId);
    const setModelId = useChatStore((state) => state.setModelId);
    const modelIdRef = useRef(modelId);
    const [providers, setProviders] = useState<ProviderStatus | null>(null);
    const [models, setModels] = useState<ProviderModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    modelIdRef.current = modelId;

    const refresh = useCallback(async () => {
        if (!isLoaded) return;
        setIsLoading(true);
        setError(null);
        try {
            const token = await getToken();
            if (!token) throw new Error('Your sign-in session is unavailable. Please sign in again.');

            const status = await fetchProviderStatus(token);
            setProviders(status);
            if (!status[providerId]) {
                setModels([]);
                return;
            }

            const availableModels = await fetchProviderModels(token, providerId);
            setModels(availableModels);
            if (availableModels.length > 0 && !availableModels.some((model) => model.id === modelIdRef.current)) {
                setModelId(availableModels[0].id);
            }
        } catch (requestError) {
            setModels([]);
            setError(requestError instanceof Error ? requestError.message : 'Unable to load provider models.');
        } finally {
            setIsLoading(false);
        }
    }, [getToken, isLoaded, providerId, setModelId]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const selectedModel = models.find((model) => model.id === modelId);
    const isConfigured = providers?.[providerId] ?? false;

    return {
        providerId,
        modelId,
        providers,
        models,
        selectedModel,
        isConfigured,
        isLoading,
        error,
        refresh,
    };
}
