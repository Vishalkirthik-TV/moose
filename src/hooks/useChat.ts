import { useState, useRef, useEffect, useCallback } from 'react';
import { useChatStore } from '@/lib/store';
import { requestChatAnswer, requestWebSearch } from '@/lib/api';
import type { Message } from '@/lib/openai';

export function useChat() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {
        activeConversationId,
        getActiveConversation,
        addMessage,
        updateLastMessage,
        updateConversationTitle,
        providerId,
        modelId,
    } = useChatStore();

    const activeConversation = getActiveConversation();

    const scrollToBottom = useCallback(() => {
        const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth';
        messagesEndRef.current?.scrollIntoView({ behavior });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [activeConversation?.messages, scrollToBottom]);

    const sendMessage = useCallback(async (
        content: string,
        {
            webSearchEnabled = false,
            thinkingEnabled = false,
            attachments = [],
        }: { webSearchEnabled?: boolean; thinkingEnabled?: boolean; attachments?: File[] } = {}
    ) => {
        const prompt = content.trim();
        const conversationId = activeConversationId;
        if (!prompt || !conversationId || isLoading) return;

        setError(null);
        setIsLoading(true);
        let hasAssistantPlaceholder = false;

        // Add user message
        const userMessage: Message = {
            role: 'user',
            content: prompt,
            attachments: attachments.map((file) => file.name),
        };
        addMessage(conversationId, userMessage);

        // Update conversation title if it's the first message
        if (activeConversation?.messages.length === 0) {
            const title = prompt.slice(0, 50) + (prompt.length > 50 ? '...' : '');
            updateConversationTitle(conversationId, title);
        }

        try {
            // Add assistant message with potential placeholder
            const assistantMessage: Message = {
                role: 'assistant',
                content: '',
                isWebSearch: webSearchEnabled,
            };
            addMessage(conversationId, assistantMessage);
            hasAssistantPlaceholder = true;

            let searchContext = '';
            let sources: Message['sources'] = [];

            if (webSearchEnabled) {
                const searchResponse = await requestWebSearch(prompt);
                if (searchResponse.results.length === 0) {
                    throw new Error('Web search found no results. Try a different query or turn web search off.');
                }
                sources = searchResponse.results;
                updateLastMessage(conversationId, { sources });
                searchContext = `
Search Results:
${searchResponse.results.map((r, i) => `[${i + 1}] "${r.title}" - ${r.snippet} (Source: ${r.link})`).join('\n')}

INSTRUCTIONS:
- You are a helpful "Answer Engine" that provides comprehensive, accurate answers based on the search results.
- Your goal is to synthesize the information into a coherent narrative.
- ALWAYS cite your sources using the format [1], [2], etc. inline where the information is used.
- If the search results don't fully answer the question, admit what you don't know but try to answer with general knowledge while clarifying what comes from search vs general knowledge.
- Format your answer in Markdown. Use bold for key terms.
- Be objective and direct.
`;
            }

            // Prepare messages for API
            const systemMessage: Message = {
                role: 'system',
                content: searchContext
                    ? `You are an AI assistant powered by web search. Use the provided Search Results to answer the user question. ${searchContext}`
                    : 'You are a helpful AI assistant. Provide accurate and concise answers.',
            };

            // Messages for the LLM (omit the raw search context from the history visible to the user, but inject it here)
            // Ideally we only inject the system prompt which contains the context
            const allMessages = [
                systemMessage,
                ...(activeConversation?.messages || []),
                userMessage,
            ];

            // Call API
            const response = await requestChatAnswer(allMessages, providerId, modelId, thinkingEnabled);
            if (!response.trim()) {
                throw new Error('The AI service returned an empty answer. Please try again.');
            }

            updateLastMessage(conversationId, { content: response, sources: sources.length > 0 ? sources : undefined });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to send message';
            setError(message);
            if (hasAssistantPlaceholder) {
                updateLastMessage(conversationId, 'I couldn’t generate an answer. Please try again.');
            }
            console.error('Error sending message:', err);
        } finally {
            setIsLoading(false);
        }
    }, [
        activeConversation,
        activeConversationId,
        addMessage,
        isLoading,
        modelId,
        providerId,
        updateConversationTitle,
        updateLastMessage,
    ]);

    return {
        messages: activeConversation?.messages || [],
        isLoading,
        error,
        sendMessage,
        messagesEndRef,
    };
}
