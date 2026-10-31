import { createPublicKey } from 'node:crypto';
import type { IncomingHttpHeaders } from 'node:http';
import { verifyToken } from '@clerk/backend';

type ProviderId = 'zai' | 'openrouter';
type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
type Model = { id: string; name: string; supportsReasoning: boolean };
type OpenRouterModel = { id?: unknown; name?: unknown; supported_parameters?: unknown };
type ClerkJwk = { kid: string; kty: 'RSA'; n: string; e: string };

export interface ApiRequest {
  headers: IncomingHttpHeaders;
  url?: string;
  body?: unknown;
}

export interface ApiResponse {
  status(code: number): this;
  json(body: unknown): this;
}

export type ApiHandler = (request: ApiRequest, response: ApiResponse) => Promise<void> | void;

const zaiModel: Model = {
  id: 'glm-4.7-flash',
  name: 'GLM 4.7 Flash',
  supportsReasoning: true,
};
let openRouterModelCache: { expiresAt: number; models: Model[] } | null = null;
let clerkJwksCache: { expiresAt: number; keys: ClerkJwk[] } | null = null;

function getHeader(request: ApiRequest, name: string): string | undefined {
  const value = request.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function configuredProviders() {
  return {
    zai: Boolean(process.env.VITE_ZAI_API_KEY),
    openrouter: Boolean(process.env.VITE_OPENROUTER_API_KEY),
  };
}

function isProviderId(value: unknown): value is ProviderId {
  return value === 'zai' || value === 'openrouter';
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    (candidate.role === 'system' || candidate.role === 'user' || candidate.role === 'assistant')
    && typeof candidate.content === 'string'
  );
}

function getClerkFrontendOrigin(): string {
  const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey || (!publishableKey.startsWith('pk_test_') && !publishableKey.startsWith('pk_live_'))) {
    throw new Error('Set VITE_CLERK_PUBLISHABLE_KEY in the deployment environment to verify sign-in sessions.');
  }

  const encodedHost = publishableKey.slice(8);
  const frontendHost = Buffer.from(encodedHost, 'base64').toString('utf8').replace(/\$$/, '');
  if (!frontendHost || !/^[a-zA-Z0-9.-]+$/.test(frontendHost)) {
    throw new Error('VITE_CLERK_PUBLISHABLE_KEY is invalid. Check the Clerk key in the deployment environment.');
  }
  return `https://${frontendHost}`;
}

function decodeSessionToken(token: string): { kid: string; issuer: string } | null {
  if (token.length > 16_384) return null;
  const [encodedHeader, encodedPayload, signature] = token.split('.');
  if (!encodedHeader || !encodedPayload || !signature) return null;

  try {
    const header: unknown = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf8'));
    const claims: unknown = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (typeof header !== 'object' || header === null || typeof claims !== 'object' || claims === null) return null;
    const { kid, alg } = header as { kid?: unknown; alg?: unknown };
    const { iss } = claims as { iss?: unknown };
    if (alg !== 'RS256' || typeof kid !== 'string' || typeof iss !== 'string') return null;
    return { kid, issuer: iss };
  } catch {
    return null;
  }
}

function isClerkJwk(value: unknown): value is ClerkJwk {
  if (typeof value !== 'object' || value === null) return false;
  const key = value as Record<string, unknown>;
  return typeof key.kid === 'string'
    && key.kty === 'RSA'
    && typeof key.n === 'string'
    && typeof key.e === 'string';
}

async function getClerkJwtKey(kid: string, frontendOrigin: string): Promise<string> {
  if (!clerkJwksCache || clerkJwksCache.expiresAt <= Date.now()
    || !clerkJwksCache.keys.some((key) => key.kid === kid)) {
    const jwksResponse = await fetch(new URL('/.well-known/jwks.json', frontendOrigin));
    if (!jwksResponse.ok) throw new Error('Unable to load session verification keys from Clerk.');

    const payload: unknown = await jwksResponse.json();
    if (typeof payload !== 'object' || payload === null || !Array.isArray((payload as { keys?: unknown }).keys)) {
      throw new Error('Clerk returned an invalid session verification key set.');
    }

    const keys = (payload as { keys: unknown[] }).keys.filter(isClerkJwk);
    if (keys.length === 0) throw new Error('Clerk did not provide any supported session verification keys.');
    clerkJwksCache = { expiresAt: Date.now() + 5 * 60 * 1000, keys };
  }

  const jwk = clerkJwksCache.keys.find((key) => key.kid === kid);
  if (!jwk) throw new Error('Clerk did not provide the key used by this session.');
  return createPublicKey({
    key: { kty: jwk.kty, n: jwk.n, e: jwk.e },
    format: 'jwk',
  }).export({ type: 'spki', format: 'pem' }).toString();
}

async function authenticate(request: ApiRequest, response: ApiResponse): Promise<boolean> {
  const authorization = getHeader(request, 'authorization');
  if (!authorization?.startsWith('Bearer ')) {
    response.status(401).json({ error: 'Sign in to use Moose services.' });
    return false;
  }

  try {
    const token = authorization.slice('Bearer '.length);
    const frontendOrigin = getClerkFrontendOrigin();
    const decodedToken = decodeSessionToken(token);
    if (!decodedToken || decodedToken.issuer !== frontendOrigin) {
      response.status(401).json({ error: 'Your sign-in session is invalid. Refresh the page and sign in again.' });
      return false;
    }

    const jwtKey = await getClerkJwtKey(decodedToken.kid, frontendOrigin);
    const requestOrigin = getHeader(request, 'origin');
    const referer = getHeader(request, 'referer');
    let refererOrigin: string | undefined;
    if (referer) {
      try {
        refererOrigin = new URL(referer).origin;
      } catch {
        refererOrigin = undefined;
      }
    }
    const deploymentUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
    const authorizedParty = process.env.APP_URL ?? requestOrigin ?? refererOrigin ?? deploymentUrl ?? 'http://localhost:5173';
    let verification: Awaited<ReturnType<typeof verifyToken>>;
    try {
      verification = await verifyToken(token, {
        jwtKey,
        authorizedParties: [authorizedParty],
      });
    } catch {
      response.status(401).json({
        error: 'The Clerk session token could not be verified. Refresh the page and sign in again if the issue continues.',
      });
      return false;
    }

    const subject = verification.data != null
      && typeof verification.data === 'object'
      && 'sub' in verification.data
      ? verification.data.sub
      : undefined;
    if (verification.errors || typeof subject !== 'string' || subject.length === 0) {
      response.status(401).json({
        error: 'The Clerk session token could not be verified. Refresh the page and sign in again if the issue continues.',
      });
      return false;
    }
    return true;
  } catch (error) {
    response.status(503).json({
      error: error instanceof Error
        ? error.message
        : 'Moose could not verify your Clerk session. Check the deployment environment configuration.',
    });
    return false;
  }
}

function withAuthentication(handler: ApiHandler): ApiHandler {
  return async (request, response) => {
    if (await authenticate(request, response)) await handler(request, response);
  };
}

function responseError(response: Response, provider: string): Error {
  return new Error(`${provider} request failed (${response.status}). Check the server configuration and try again.`);
}

async function getOpenRouterModels(): Promise<Model[]> {
  const apiKey = process.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OpenRouter is not configured. Set VITE_OPENROUTER_API_KEY in the deployment environment.');
  if (openRouterModelCache && openRouterModelCache.expiresAt > Date.now()) {
    return openRouterModelCache.models;
  }

  const response = await fetch('https://openrouter.ai/api/v1/models', {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.APP_URL ?? 'https://moose.vercel.app',
      'X-Title': 'Moose',
    },
  });
  if (!response.ok) throw responseError(response, 'OpenRouter model listing');

  const payload: unknown = await response.json();
  if (typeof payload !== 'object' || payload === null || !Array.isArray((payload as { data?: unknown }).data)) {
    throw new Error('OpenRouter returned an invalid model list.');
  }

  const models = ((payload as { data: OpenRouterModel[] }).data)
    .filter((model): model is OpenRouterModel & { id: string } =>
      typeof model.id === 'string' && model.id.length > 0
    )
    .map((model) => {
      const parameters = Array.isArray(model.supported_parameters)
        ? model.supported_parameters.filter((parameter): parameter is string => typeof parameter === 'string')
        : [];
      return {
        id: model.id,
        name: typeof model.name === 'string' && model.name.length > 0 ? model.name : model.id,
        supportsReasoning: parameters.includes('reasoning'),
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));

  if (models.length === 0) throw new Error('OpenRouter did not return any available models.');
  openRouterModelCache = { expiresAt: Date.now() + 5 * 60 * 1000, models };
  return models;
}

async function providerModels(provider: ProviderId): Promise<Model[]> {
  if (!configuredProviders()[provider]) {
    const keyName = provider === 'zai' ? 'VITE_ZAI_API_KEY' : 'VITE_OPENROUTER_API_KEY';
    throw new Error(`${provider === 'zai' ? 'Z.AI' : 'OpenRouter'} is not configured. Set ${keyName} in the deployment environment.`);
  }
  return provider === 'zai' ? [zaiModel] : getOpenRouterModels();
}

export const providerStatusHandler = withAuthentication((_request, response) => {
  response.json({ providers: configuredProviders() });
});

export const providerModelsHandler = withAuthentication(async (request, response) => {
  const url = new URL(request.url ?? '/api/providers/models', 'http://localhost');
  const provider = url.searchParams.get('provider');
  if (!isProviderId(provider)) {
    response.status(400).json({ error: 'Choose a supported provider.' });
    return;
  }

  try {
    response.json({ models: await providerModels(provider) });
  } catch (error) {
    response.status(503).json({ error: error instanceof Error ? error.message : 'Unable to load provider models.' });
  }
});

export const chatHandler = withAuthentication(async (request, response) => {
  const body = typeof request.body === 'object' && request.body !== null
    ? request.body as Record<string, unknown>
    : {};
  const { provider, model, messages, thinkingEnabled } = body;

  if (!isProviderId(provider) || typeof model !== 'string' || !Array.isArray(messages)
    || messages.length === 0 || messages.length > 80 || !messages.every(isChatMessage)
    || typeof thinkingEnabled !== 'boolean') {
    response.status(400).json({ error: 'The chat request is invalid.' });
    return;
  }
  if (messages.some((message) => message.content.length > 100_000)) {
    response.status(413).json({ error: 'The chat is too large to send.' });
    return;
  }

  try {
    const models = await providerModels(provider);
    const selectedModel = models.find((candidate) => candidate.id === model);
    if (!selectedModel) {
      response.status(400).json({ error: 'The selected model is not available for this provider.' });
      return;
    }
    if (thinkingEnabled && !selectedModel.supportsReasoning) {
      response.status(400).json({ error: 'Thinking mode is not supported by the selected model.' });
      return;
    }

    const apiKey = provider === 'zai' ? process.env.VITE_ZAI_API_KEY : process.env.VITE_OPENROUTER_API_KEY;
    const endpoint = provider === 'zai'
      ? 'https://api.z.ai/api/paas/v4/chat/completions'
      : 'https://openrouter.ai/api/v1/chat/completions';
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = process.env.APP_URL ?? 'https://moose.vercel.app';
      headers['X-Title'] = 'Moose';
    }

    const upstreamBody: Record<string, unknown> = {
      model,
      messages,
    };
    if (thinkingEnabled) {
      upstreamBody[provider === 'zai' ? 'thinking' : 'reasoning'] = provider === 'zai'
        ? { type: 'enabled' }
        : { effort: 'medium' };
    }

    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(upstreamBody),
    });
    if (!upstream.ok) throw responseError(upstream, provider === 'zai' ? 'Z.AI' : 'OpenRouter');

    const payload: unknown = await upstream.json();
    const choice = typeof payload === 'object' && payload !== null
      ? (payload as { choices?: Array<{ message?: { content?: unknown } }> }).choices?.[0]
      : undefined;
    const content = choice?.message?.content;
    const text = typeof content === 'string'
      ? content
      : Array.isArray(content)
        ? content.map((part) => typeof part === 'object' && part !== null && 'text' in part
          && typeof part.text === 'string' ? part.text : '').join('')
        : '';
    if (!text.trim()) throw new Error('The provider returned an empty answer. Please try again.');
    response.json({ content: text });
  } catch (error) {
    response.status(502).json({ error: error instanceof Error ? error.message : 'The AI provider request failed.' });
  }
});

export const searchHandler = withAuthentication(async (request, response) => {
  const body = typeof request.body === 'object' && request.body !== null
    ? request.body as Record<string, unknown>
    : {};
  const query = typeof body.query === 'string' ? body.query.trim() : '';
  if (!query || query.length > 500) {
    response.status(400).json({ error: 'Enter a search query of 1 to 500 characters.' });
    return;
  }

  const apiKey = process.env.VITE_SERPAPI_KEY;
  if (!apiKey) {
    response.status(503).json({ error: 'Web search is not configured. Set VITE_SERPAPI_KEY in the deployment environment.' });
    return;
  }

  try {
    const params = new URLSearchParams({
      engine: 'google',
      q: query,
      api_key: apiKey,
      num: '8',
    });
    const upstream = await fetch(`https://serpapi.com/search.json?${params}`);
    if (!upstream.ok) throw responseError(upstream, 'Web search');

    const payload: unknown = await upstream.json();
    if (typeof payload !== 'object' || payload === null) throw new Error('Web search returned an invalid response.');
    const organicResults = (payload as { organic_results?: unknown }).organic_results;
    const results = Array.isArray(organicResults)
      ? organicResults.flatMap((result, index) => {
        if (typeof result !== 'object' || result === null) return [];
        const item = result as Record<string, unknown>;
        if (typeof item.title !== 'string' || typeof item.link !== 'string') return [];
        let source = typeof item.source === 'string' ? item.source : '';
        try {
          source ||= new URL(item.link).hostname;
        } catch {
          source ||= 'Web';
        }
        return [{
          title: item.title,
          link: item.link,
          snippet: typeof item.snippet === 'string' ? item.snippet : '',
          source,
          date: typeof item.date === 'string' ? item.date : undefined,
          favicon: typeof item.favicon === 'string' ? item.favicon : undefined,
          position: index + 1,
        }];
      })
      : [];
    response.json({ results });
  } catch (error) {
    response.status(502).json({ error: error instanceof Error ? error.message : 'Web search failed.' });
  }
});

export function createLocalAuthenticationMiddleware() {
  return async (request: ApiRequest, response: ApiResponse, next: () => void) => {
    if (await authenticate(request, response)) next();
  };
}
