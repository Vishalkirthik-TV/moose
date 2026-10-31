import { ChatMessage } from './ChatMessage';
import type { Message } from '@/lib/openai';

interface ChatListProps {
    messages: Message[];
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
    onSend?: (message: string) => void;
    error?: string | null;
}

export function ChatList({ messages, messagesEndRef, onSend, error }: ChatListProps) {
    if (messages.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-xl space-y-4 text-center">
                    <h1 className="text-3xl font-semibold tracking-[-0.035em] text-foreground/90 md:text-4xl">
                        What do you want to know?
                    </h1>
                    <p className="text-base leading-7 text-muted-foreground">
                        Search the web with AI-powered answers
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="mx-auto w-full max-w-4xl py-3 sm:py-5">
                {messages.map((message, index) => (
                    <ChatMessage
                        key={index}
                        message={message}
                        isFirst={index === 0}
                        onRelatedSelect={onSend}
                    />
                ))}
                {error && (
                    <div className="mx-4 mb-6 rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-foreground sm:mx-0" role="alert">
                        <p className="font-medium">Moose couldn’t finish that answer.</p>
                        <p className="mt-1 text-muted-foreground">{error}</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}
