import { useEffect, useRef } from 'react';
import { ChatList } from '@/components/ChatList';
import { ChatInput } from '@/components/ChatInput';
import { useChat } from '@/hooks/useChat';
import { useChatStore } from '@/lib/store';
import { WorkspaceLayout } from '@/components/WorkspaceLayout';

export function Chat() {
    const { messages, isLoading, error, sendMessage, messagesEndRef } = useChat();
    const { activeConversationId, createConversation } = useChatStore();
    const initialPromptRef = useRef(
        new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('prompt')
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
        window.history.replaceState(
            window.history.state,
            '',
            `${window.location.pathname}${window.location.search}#/chat`
        );
        void sendMessage(prompt);
    }, [activeConversationId, sendMessage]);

    return (
        <WorkspaceLayout>
            <ChatList messages={messages} messagesEndRef={messagesEndRef} onSend={sendMessage} error={error} />
            <ChatInput onSend={sendMessage} disabled={isLoading} />
        </WorkspaceLayout>
    );
}
