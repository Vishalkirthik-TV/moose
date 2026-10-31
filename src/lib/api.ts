import type { ProviderId, ProviderModel, ProviderStatus } from './providers';
import type { Message } from './openai';

interface ApiError {
    error?: unknown;
}

async function requestApi<T>(path: string, token: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`/api${path}`, {
        ...init,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
            ...init?.headers,
        },
    });

    const responseText = await response.text();
    let payload: unknown = null;
    try {
        payload = responseText ? JSON.parse(responseText) as unknown : null;
    } catch {
        payload = null;
    }
    if (!response.ok) {
        const message = typeof payload === 'object' && payload !== null
            ? (payload as ApiError).error
            : null;
        if (typeof message === 'string') throw new Error(message);
        if (response.status >= 500) {
            throw new Error(`Moose API is unavailable (${response.status}). Stop the old dev server and restart the app with "npm run dev" so both the API and frontend start.`);
        }
        throw new Error(`Request failed (${response.status}).`);
    }

    if (payload === null) throw new Error('The Moose API returned an empty response.');
    return payload as T;
}

export async function fetchProviderStatus(token: string): Promise<ProviderStatus> {
    const result = await requestApi<{ providers: ProviderStatus }>('/providers/status', token);
    return result.providers;
}

export async function fetchProviderModels(token: string, provider: ProviderId): Promise<ProviderModel[]> {
    const result = await requestApi<{ models: ProviderModel[] }>(
        `/providers/models?provider=${encodeURIComponent(provider)}`,
        token,
    );
    return result.models;
}

export async function requestChatAnswer(
    token: string,
    messages: Message[],
    provider: ProviderId,
    model: string,
    thinkingEnabled: boolean,
): Promise<string> {
    const result = await requestApi<{ content: string }>('/chat', token, {
        method: 'POST',
        body: JSON.stringify({ messages, provider, model, thinkingEnabled }),
    });
    return result.content;
}

export interface SearchResult {
    title: string;
    link: string;
    snippet: string;
    source: string;
    date?: string;
    favicon?: string;
    position: number;
}

export interface SearchResponse {
    results: SearchResult[];
}

export async function requestWebSearch(token: string, query: string): Promise<SearchResponse> {
    return requestApi<SearchResponse>('/search', token, {
        method: 'POST',
        body: JSON.stringify({ query }),
    });
}
