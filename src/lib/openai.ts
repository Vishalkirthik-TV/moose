import OpenAI from 'openai';

const ZAI_API_KEY = import.meta.env.VITE_ZAI_API_KEY;

export interface Source {
    title: string;
    link: string;
    source: string;
    position: number;
    favicon?: string;
}

export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
    sources?: Source[];
}

const client = new OpenAI({
    apiKey: ZAI_API_KEY,
    baseURL: 'https://api.z.ai/api/paas/v4/',
    dangerouslyAllowBrowser: true, // Required for frontend usage
});

export async function sendChatMessage(messages: Message[]): Promise<string> {
    for (let attempt = 0; ; attempt += 1) {
        try {
            const completion = await client.chat.completions.create({
                model: 'glm-4.7-flash',
                messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
            });

            return completion.choices[0]?.message?.content || '';
        } catch (error) {
            const isTemporaryFailure = error instanceof OpenAI.APIError
                && (error.code === '1305' || error.status >= 500);

            if (isTemporaryFailure && attempt < 2) {
                await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
                continue;
            }

            console.error('Chat API Error:', error);
            if (error instanceof OpenAI.APIError && error.code === '1305') {
                throw new Error('The AI service is temporarily busy. Please try again in a moment.');
            }
            throw error;
        }
    }
}
