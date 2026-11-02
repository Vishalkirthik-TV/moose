import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiCheck, FiShare2 } from 'react-icons/fi';
import { ChatList } from '@/components/ChatList';
import { ChatInput } from '@/components/ChatInput';
import { useChat } from '@/hooks/useChat';
import { useChatStore } from '@/lib/store';
import { WorkspaceLayout } from '@/components/WorkspaceLayout';
import { Button } from '@/components/ui/button';
import { consumePendingChatOptions } from '@/lib/pendingChat';
import { useProviderModels } from '@/hooks/useProviderModels';

export function Chat() {
    const { messages, isLoading, error, sendMessage, messagesEndRef } = useChat();
    const { providerId, modelId, models, isLoading: areModelsLoading, selectedModel, error: modelError } = useProviderModels();
    const activeConversationId = useChatStore((state) => state.activeConversationId);
    const setModelId = useChatStore((state) => state.setModelId);
    const activeConversation = useChatStore((state) =>
        state.conversations.find((conversation) => conversation.id === state.activeConversationId) ?? null
    );
    const createConversation = useChatStore((state) => state.createConversation);
    const location = useLocation();
    const navigate = useNavigate();
    const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared'>('idle');
    const [shareError, setShareError] = useState<string | null>(null);
    // Read once on mount: the Welcome page hands off ?prompt=... via the URL
    const initialPromptRef = useRef(
        new URLSearchParams(location.search).get('prompt')
    );
    const initialWebSearchEnabledRef = useRef(
        new URLSearchParams(location.search).get('webSearch') === '1'
    );
    const initialThinkingEnabledRef = useRef(
        new URLSearchParams(location.search).get('thinking') === '1'
    );
    const submittedInitialPromptRef = useRef(false);

    // Create initial conversation if none exists
    useEffect(() => {
        if (!activeConversationId) {
            createConversation();
        }
    }, [activeConversationId, createConversation]);

    useEffect(() => {
        const prompt = initialPromptRef.current;
        if (!prompt || !activeConversationId || submittedInitialPromptRef.current) return;

        submittedInitialPromptRef.current = true;
        navigate('/chat', { replace: true });
        const pendingOptions = consumePendingChatOptions();
        void sendMessage(prompt, {
            webSearchEnabled: pendingOptions?.webSearchEnabled ?? initialWebSearchEnabledRef.current,
            thinkingEnabled: pendingOptions?.thinkingEnabled ?? initialThinkingEnabledRef.current,
            attachments: pendingOptions?.attachments,
        });
    }, [activeConversationId, navigate, sendMessage]);

    useEffect(() => {
        setShareStatus('idle');
        setShareError(null);
    }, [activeConversationId]);

    const handleShare = async () => {
        if (!activeConversation) return;

        const transcript = [
            `Moose conversation: ${activeConversation.title}`,
            '',
            ...activeConversation.messages
                .filter((message) => message.role !== 'system')
                .map((message) => {
                    const role = message.role === 'user' ? 'You' : 'Moose';
                    const sources = message.sources?.length
                        ? `\n\nSources:\n${message.sources.map((source) => `- ${source.title}: ${source.link}`).join('\n')}`
                        : '';
                    return `${role}\n${message.content}${sources}`;
                }),
        ].join('\n\n');

        setShareError(null);
        setShareStatus('idle');
        try {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: `${activeConversation.title} — Moose`,
                        text: transcript,
                    });
                    setShareStatus('shared');
                    return;
                } catch (error) {
                    if (error instanceof Error && error.name === 'AbortError') return;
                }
            }

            if (!navigator.clipboard?.writeText) {
                throw new Error('Clipboard access is unavailable in this browser.');
            }
            await navigator.clipboard.writeText(transcript);
            setShareStatus('copied');
        } catch (error) {
            console.error('Unable to share conversation:', error);
            setShareError('Could not share this chat. Check your browser permissions and try again.');
        }
    };

    return (
        <WorkspaceLayout
            headerActions={(
                <div className="flex items-center gap-2">
                    {shareStatus !== 'idle' && (
                        <span className="hidden text-xs text-muted-foreground sm:inline" role="status">
                            {shareStatus === 'copied' ? 'Copied to clipboard' : 'Shared'}
                        </span>
                    )}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        disabled={!activeConversation?.messages.some((message) => message.role !== 'system')}
                        className="h-9 rounded-xl border-border/80 bg-card/80 px-3 shadow-sm"
                    >
                        {shareStatus === 'copied'
                            ? <FiCheck aria-hidden="true" className="h-4 w-4 text-primary" />
                            : <FiShare2 aria-hidden="true" className="h-4 w-4" />}
                        <span>{shareStatus === 'copied' ? 'Copied' : 'Share'}</span>
                    </Button>
                    {shareError && (
                        <span
                            className="fixed right-4 top-[4.25rem] z-50 max-w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-destructive/20 bg-card px-3.5 py-3 text-xs leading-5 text-destructive shadow-lg"
                            role="alert"
                        >
                            {shareError}
                        </span>
                    )}
                </div>
            )}
        >
            <ChatList messages={messages} messagesEndRef={messagesEndRef} onSend={sendMessage} error={error} />
            <ChatInput
                onSend={(prompt, options) => sendMessage(prompt, options)}
                disabled={isLoading}
                defaultWebSearchEnabled={initialWebSearchEnabledRef.current}
                defaultThinkingEnabled={initialThinkingEnabledRef.current}
                models={models}
                providerId={providerId}
                modelId={modelId}
                onModelChange={setModelId}
                modelsLoading={areModelsLoading}
                supportsThinking={selectedModel?.supportsReasoning}
                modelError={modelError}
            />
        </WorkspaceLayout>
    );
}
