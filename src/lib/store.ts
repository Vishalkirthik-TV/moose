import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message } from './openai';
import { DEFAULT_MODELS, type ProviderId } from './providers';

export interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    spaceId: string | null;
    createdAt: number;
    updatedAt: number;
}

export interface ChatSpace {
    id: string;
    name: string;
    createdAt: number;
}

interface ChatStore {
    conversations: Conversation[];
    spaces: ChatSpace[];
    activeConversationId: string | null;
    providerId: ProviderId;
    modelId: string;

    // Actions
    createConversation: () => string;
    createSpace: (name: string) => string;
    deleteSpace: (id: string) => void;
    assignConversationToSpace: (conversationId: string, spaceId: string | null) => void;
    deleteConversation: (id: string) => void;
    setActiveConversation: (id: string) => void;
    setProviderId: (providerId: ProviderId) => void;
    setModelId: (modelId: string) => void;
    addMessage: (conversationId: string, message: Message) => void;
    updateLastMessage: (conversationId: string, updates: string | Partial<Message>) => void;
    updateConversationTitle: (conversationId: string, title: string) => void;
    getActiveConversation: () => Conversation | null;
}

export const useChatStore = create<ChatStore>()(
    persist(
        (set, get) => ({
            conversations: [],
            spaces: [],
            activeConversationId: null,
            providerId: 'zai',
            modelId: DEFAULT_MODELS.zai,

            createConversation: () => {
                const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const newConversation: Conversation = {
                    id,
                    title: 'New Chat',
                    messages: [],
                    spaceId: null,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                };

                set((state) => ({
                    conversations: [newConversation, ...state.conversations],
                    activeConversationId: id,
                }));

                return id;
            },

            createSpace: (name) => {
                const id = `space_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
                const space: ChatSpace = { id, name: name.trim(), createdAt: Date.now() };
                set((state) => ({ spaces: [space, ...state.spaces] }));
                return id;
            },

            deleteSpace: (id) => {
                set((state) => ({
                    spaces: state.spaces.filter((space) => space.id !== id),
                    conversations: state.conversations.map((conversation) =>
                        conversation.spaceId === id ? { ...conversation, spaceId: null } : conversation
                    ),
                }));
            },

            assignConversationToSpace: (conversationId, spaceId) => {
                set((state) => ({
                    conversations: state.conversations.map((conversation) =>
                        conversation.id === conversationId
                            ? { ...conversation, spaceId, updatedAt: Date.now() }
                            : conversation
                    ),
                }));
            },

            deleteConversation: (id) => {
                set((state) => {
                    const newConversations = state.conversations.filter((c) => c.id !== id);
                    const newActiveId = state.activeConversationId === id
                        ? (newConversations[0]?.id || null)
                        : state.activeConversationId;

                    return {
                        conversations: newConversations,
                        activeConversationId: newActiveId,
                    };
                });
            },

            setActiveConversation: (id) => {
                set({ activeConversationId: id });
            },

            setProviderId: (providerId) => {
                set({ providerId, modelId: DEFAULT_MODELS[providerId] });
            },

            setModelId: (modelId) => {
                set({ modelId });
            },

            addMessage: (conversationId, message) => {
                const messageWithTimestamp = { ...message, sentAt: message.sentAt ?? Date.now() };
                set((state) => ({
                    conversations: state.conversations.map((conv) =>
                        conv.id === conversationId
                            ? {
                                ...conv,
                                messages: [...conv.messages, messageWithTimestamp],
                                updatedAt: Date.now(),
                            }
                            : conv
                    ),
                }));
            },

            updateLastMessage: (conversationId, updates) => {
                set((state) => ({
                    conversations: state.conversations.map((conv) =>
                        conv.id === conversationId
                            ? {
                                ...conv,
                                messages: conv.messages.map((msg, idx) =>
                                    idx === conv.messages.length - 1
                                        ? { ...msg, ...(typeof updates === 'string' ? { content: updates } : updates) }
                                        : msg
                                ),
                                updatedAt: Date.now(),
                            }
                            : conv
                    ),
                }));
            },

            updateConversationTitle: (conversationId, title) => {
                set((state) => ({
                    conversations: state.conversations.map((conv) =>
                        conv.id === conversationId
                            ? { ...conv, title, updatedAt: Date.now() }
                            : conv
                    ),
                }));
            },

            getActiveConversation: () => {
                const state = get();
                return state.conversations.find((c) => c.id === state.activeConversationId) || null;
            },
        }),
        {
            name: 'chat-storage',
            version: 3,
            migrate: (persistedState) => {
                const state = persistedState as Partial<ChatStore> | undefined;
                const providerId = state?.providerId === 'openrouter' ? 'openrouter' : 'zai';
                return {
                    ...state,
                    providerId,
                    modelId: state?.modelId ?? DEFAULT_MODELS[providerId],
                    spaces: state?.spaces ?? [],
                    conversations: (state?.conversations ?? []).map((conversation) => ({
                        ...conversation,
                        spaceId: conversation.spaceId ?? null,
                    })),
                };
            },
        }
    )
);
