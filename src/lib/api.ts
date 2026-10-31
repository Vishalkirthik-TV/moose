import type { ProviderId, ProviderModel, ProviderStatus } from './providers';
import { DEFAULT_MODELS } from './providers';
import type { Message } from './openai';

const providerKeys: Record<ProviderId, string | undefined> = {
    zai: import.meta.env.VITE_ZAI_API_KEY,
    openrouter: import.meta.env.VITE_OPENROUTER_API_KEY,
};

const providerNames: Record<ProviderId, string> = {
    zai: 'Z.AI',
    openrouter: 'OpenRouter',
};

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

function getApiKey(provider: ProviderId): string {
    const key = providerKeys[provider];
    if (!key) {
        const keyName = provider === 'zai' ? 'VITE_ZAI_API_KEY' : 'VITE_OPENROUTER_API_KEY';
        throw new Error(`${providerNames[provider]} is not configured. Add ${keyName} to your .env file and restart Moose.`);
    }
    return key;
}

async function readJson(response: Response, service: string): Promise<unknown> {
    const responseText = await response.text();
    let payload: unknown;
    try {
        payload = responseText ? JSON.parse(responseText) as unknown : null;
    } catch {
        throw new Error(`${service} returned an invalid response (${response.status}).`);
    }

    if (!response.ok) {
        const error = typeof payload === 'object' && payload !== null
            ? (payload as { error?: unknown }).error
            : null;
        const message = typeof error === 'object' && error !== null && 'message' in error
            ? error.message
            : error;
        if (typeof message === 'string') throw new Error(`${service}: ${message}`);
        throw new Error(`${service} request failed (${response.status}). Check the API key and try again.`);
    }

    return payload;
}

export function getProviderStatus(): ProviderStatus {
    return {
        zai: Boolean(providerKeys.zai),
        openrouter: Boolean(providerKeys.openrouter),
    };
}

export async function fetchProviderModels(provider: ProviderId): Promise<ProviderModel[]> {
    const apiKey = getApiKey(provider);
    if (provider === 'zai') {
        return [{
            id: DEFAULT_MODELS.zai,
            name: 'GLM 4.7 Flash',
            supportsReasoning: true,
        }];
    }

    const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
    });
    const payload = await readJson(response, 'OpenRouter model listing');
    const data = typeof payload === 'object' && payload !== null
        ? (payload as { data?: unknown }).data
        : null;
    if (!Array.isArray(data)) {
        throw new Error('OpenRouter returned an invalid model list.');
    }

    const models = data.flatMap((item): ProviderModel[] => {
        if (typeof item !== 'object' || item === null) return [];
        const model = item as { id?: unknown; name?: unknown; supported_parameters?: unknown };
        if (typeof model.id !== 'string' || !model.id) return [];
        const parameters = Array.isArray(model.supported_parameters)
            ? model.supported_parameters.filter((parameter): parameter is string => typeof parameter === 'string')
            : [];
        return [{
            id: model.id,
            name: typeof model.name === 'string' && model.name ? model.name : model.id,
            supportsReasoning: parameters.includes('reasoning'),
        }];
    }).sort((left, right) => left.name.localeCompare(right.name));

    if (models.length === 0) throw new Error('OpenRouter did not return any available models.');
    return models;
}

export async function requestChatAnswer(
    messages: Message[],
    provider: ProviderId,
    model: string,
    thinkingEnabled: boolean,
): Promise<string> {
    const apiKey = getApiKey(provider);
    const isZai = provider === 'zai';
    const endpoint = isZai
        ? 'https://api.z.ai/api/paas/v4/chat/completions'
        : 'https://openrouter.ai/api/v1/chat/completions';
    const body: Record<string, unknown> = {
        model,
        messages: messages.map(({ role, content }) => ({ role, content })),
    };
    if (thinkingEnabled) {
        body[isZai ? 'thinking' : 'reasoning'] = isZai
            ? { type: 'enabled' }
            : { effort: 'medium' };
    }

    const headers: Record<string, string> = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
    };
    if (!isZai) {
        headers['HTTP-Referer'] = window.location.origin;
        headers['X-Title'] = 'Moose';
    }

    const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });
    const payload = await readJson(response, providerNames[provider]);
    const choices = typeof payload === 'object' && payload !== null
        ? (payload as { choices?: unknown }).choices
        : null;
    const firstChoice = Array.isArray(choices) ? choices[0] : null;
    const message = typeof firstChoice === 'object' && firstChoice !== null
        ? (firstChoice as { message?: unknown }).message
        : null;
    const content = typeof message === 'object' && message !== null
        ? (message as { content?: unknown }).content
        : null;
    const text = typeof content === 'string'
        ? content
        : Array.isArray(content)
            ? content.flatMap((part) => {
                if (typeof part !== 'object' || part === null) return [];
                const partText = (part as { text?: unknown }).text;
                return typeof partText === 'string' ? [partText] : [];
            }).join('')
            : '';

    if (!text.trim()) throw new Error(`${providerNames[provider]} returned an empty answer. Please try again.`);
    return text;
}

export async function requestWebSearch(query: string): Promise<SearchResponse> {
    const apiKey = import.meta.env.VITE_SERPAPI_KEY;
    if (!apiKey) {
        throw new Error('Web search is not configured. Add VITE_SERPAPI_KEY to your .env file and restart Moose.');
    }

    const params = new URLSearchParams({
        engine: 'google',
        q: query,
        api_key: apiKey,
        num: '8',
    });
    const response = await fetch(`https://serpapi.com/search.json?${params}`);
    const payload = await readJson(response, 'Web search');
    if (typeof payload !== 'object' || payload === null) {
        throw new Error('Web search returned an invalid response.');
    }

    const error = (payload as { error?: unknown }).error;
    if (typeof error === 'string') throw new Error(`Web search: ${error}`);
    const organicResults = (payload as { organic_results?: unknown }).organic_results;
    const results = Array.isArray(organicResults)
        ? organicResults.flatMap((item, index): SearchResult[] => {
            if (typeof item !== 'object' || item === null) return [];
            const result = item as Record<string, unknown>;
            if (typeof result.title !== 'string' || typeof result.link !== 'string') return [];
            let source = typeof result.source === 'string' ? result.source : '';
            try {
                source ||= new URL(result.link).hostname;
            } catch {
                source ||= 'Web';
            }
            return [{
                title: result.title,
                link: result.link,
                snippet: typeof result.snippet === 'string' ? result.snippet : '',
                source,
                date: typeof result.date === 'string' ? result.date : undefined,
                favicon: typeof result.favicon === 'string' ? result.favicon : undefined,
                position: index + 1,
            }];
        })
        : [];
    return { results };
}
