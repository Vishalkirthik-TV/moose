import { useState } from 'react';
import type { Message } from '@/lib/openai';
import { SourceCarousel } from './SourceCarousel';
import { ThinkingIndicator } from './ThinkingIndicator';
import { RelatedQuestions } from './RelatedQuestions';
import { Markdown } from './Markdown';
import { FiCopy, FiShare2, FiCheck } from 'react-icons/fi';
import { MooseLogo } from './MooseLogo';

interface ChatMessageProps {
    message: Message;
    isFirst?: boolean;
    onRelatedSelect?: (question: string) => void;
    isWebOn?: boolean;
}

export function ChatMessage({ message, onRelatedSelect, isWebOn = false }: ChatMessageProps) {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    const [copied, setCopied] = useState(false);
    const sentAtLabel = message.sentAt
        ? (() => {
            const sentAt = new Date(message.sentAt);
            const today = new Date();
            const isToday = sentAt.toDateString() === today.toDateString();
            const time = sentAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
            return `${isToday ? 'Today' : sentAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ${time}`;
        })()
        : null;

    if (isSystem) return null;

    const handleCopy = async () => {
        if (message.content) {
            await navigator.clipboard.writeText(message.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleShare = async () => {
        if (navigator.share && message.content) {
            await navigator.share({
                title: 'Moose Answer',
                text: message.content,
            });
        }
    };

    // Sample related questions (in production, these would come from the API)
    const relatedQuestions = message.content ? [
        'How does this compare to similar topics?',
        'What are the practical applications?',
        'Tell me more about the history',
    ] : [];

    // User message: Display as right-aligned bubble
    if (isUser) {
        return (
            <div className="w-full px-4 pb-2 pt-6 md:px-0">
                <div className="mx-auto flex max-w-3xl justify-end">
                    <div className="flex max-w-[88%] flex-col items-start sm:max-w-[80%]">
                        {sentAtLabel && message.sentAt && (
                            <time
                                dateTime={new Date(message.sentAt).toISOString()}
                                className="mb-2 ml-1 text-xs font-medium text-muted-foreground"
                            >
                                {sentAtLabel}
                            </time>
                        )}
                        {message.attachments && message.attachments.length > 0 && (
                            <ul className="mb-2 flex flex-wrap gap-1.5">
                                {message.attachments.map((fileName, index) => (
                                    <li key={`${fileName}-${index}`} className="max-w-full truncate rounded-full border border-border/50 bg-card/80 px-2.5 py-1 text-xs text-muted-foreground">
                                        {fileName}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="rounded-3xl rounded-br-lg border border-primary/10 bg-primary px-4 py-3 text-primary-foreground shadow-sm">
                            <p className="text-sm leading-6 md:text-base">
                                {message.content}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const isMessageWebOn = message.isWebSearch !== undefined
        ? message.isWebSearch
        : Boolean((message.sources && message.sources.length > 0) || isWebOn);

    // Assistant message: Structured answer with sources
    return (
        <div className="w-full px-4 pb-8 md:px-0">
            <div className="mx-auto max-w-3xl">
                {/* Sources Section */}
                {message.sources && message.sources.length > 0 && (
                    <SourceCarousel sources={message.sources} />
                )}

                {/* Answer Section - Clean, flat, no bubbles */}
                <div className="mt-6">
                    <div className="mb-4 flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/70 bg-card">
                            <MooseLogo size="sm" />
                        </div>
                        <span className="text-sm font-semibold tracking-[-0.01em] text-foreground">Moose</span>
                        <span className="text-xs text-muted-foreground">Answer</span>
                    </div>

                    {message.content ? (
                        <>
                            <Markdown content={message.content} />

                            {/* Action Buttons */}
                            <div className="mt-6 flex items-center gap-2 border-t border-border/50 pt-4">
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 rounded-xl border border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-[0.98]"
                                >
                                    {copied ? <FiCheck className="w-3.5 h-3.5 text-green-500" /> : <FiCopy className="w-3.5 h-3.5" />}
                                    <span>{copied ? 'Copied' : 'Copy'}</span>
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-1.5 rounded-xl border border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-[0.98]"
                                >
                                    <FiShare2 className="w-3.5 h-3.5" />
                                    <span>Share</span>
                                </button>
                            </div>

                            {/* Related Questions */}
                            {onRelatedSelect && (
                                <RelatedQuestions
                                    questions={relatedQuestions}
                                    onSelect={onRelatedSelect}
                                />
                            )}
                        </>
                    ) : (
                        <ThinkingIndicator isWebOn={isMessageWebOn} />
                    )}
                </div>
            </div>
        </div>
    );
}
