import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/openai';
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useTheme } from '@/components/theme-provider';
import { SourceCarousel } from './SourceCarousel';
import { ThinkingIndicator } from './ThinkingIndicator';
import { RelatedQuestions } from './RelatedQuestions';
import { FiCopy, FiShare2, FiCheck } from 'react-icons/fi';
import { MooseLogo } from './MooseLogo';

interface ChatMessageProps {
    message: Message;
    isFirst?: boolean;
    onRelatedSelect?: (question: string) => void;
}

export function ChatMessage({ message, onRelatedSelect }: ChatMessageProps) {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    const [copied, setCopied] = useState(false);
    const { theme } = useTheme();
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
                            <div className="prose prose-neutral dark:prose-invert max-w-none text-foreground leading-relaxed text-base">
                                <ReactMarkdown
                                    components={{
                                        a: ({ children, href }) => (
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline font-medium"
                                            >
                                                {children}
                                            </a>
                                        ),
                                        p: ({ children }) => (
                                            <p className="mb-4 last:mb-0">{children}</p>
                                        ),
                                        ul: ({ children }) => (
                                            <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>
                                        ),
                                        ol: ({ children }) => (
                                            <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>
                                        ),
                                        strong: ({ children }) => (
                                            <strong className="font-semibold text-foreground">{children}</strong>
                                        ),
                                        code: ({ node, className, children, ...props }) => {
                                            void node;
                                            const match = /language-(\w+)/.exec(className || '');
                                            const language = match ? match[1] : 'text';
                                            const codeString = String(children).replace(/\n$/, '');
                                            const isInline = !className?.startsWith('language-') && !String(children).endsWith('\n');

                                            if (isInline) {
                                                return (
                                                    <code
                                                        className="px-1.5 py-0.5 rounded-md bg-muted/60 font-mono text-sm text-primary"
                                                        {...props}
                                                    >
                                                        {children}
                                                    </code>
                                                );
                                            }

                                            return (
                                                <div className={cn("relative w-full overflow-hidden rounded-lg my-4 border border-border/50", theme === 'dark' ? 'bg-[#282c34]' : 'bg-[#f8f8f8]')}>
                                                    {/* Code Header */}
                                                    <div className={cn("flex items-center justify-between px-4 py-2 border-b text-xs select-none", theme === 'dark' ? 'bg-[#21252b] border-white/10 text-gray-400' : 'bg-[#e5e7eb] border-gray-300 text-gray-600')}>
                                                        <span className="font-mono font-medium lowercase">{language}</span>
                                                        <button
                                                            onClick={async () => {
                                                                await navigator.clipboard.writeText(codeString);
                                                                // You might want a toast here
                                                            }}
                                                            className={cn("flex items-center gap-1.5 transition-colors", theme === 'dark' ? 'hover:text-white' : 'hover:text-black')}
                                                        >
                                                            <FiCopy className="w-3.5 h-3.5" />
                                                            <span>Copy</span>
                                                        </button>
                                                    </div>

                                                    {/* Code Content */}
                                                    <div className="w-full overflow-x-auto">
                                                        <SyntaxHighlighter
                                                            language={language}
                                                            style={theme === 'dark' ? atomOneDark : docco}
                                                            customStyle={{
                                                                margin: 0,
                                                                padding: '1.5rem',
                                                                background: 'transparent',
                                                                fontSize: '0.875rem',
                                                                lineHeight: '1.5',
                                                            }}
                                                            wrapLongLines={false} // Allow horizontal scroll for overflow
                                                            PreTag="div"
                                                        >
                                                            {codeString}
                                                        </SyntaxHighlighter>
                                                    </div>
                                                </div>
                                            );
                                        },
                                        pre: ({ children }) => (
                                            <div className="not-prose">{children}</div>
                                        ),
                                    }}
                                >
                                    {message.content}
                                </ReactMarkdown>
                            </div>

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
                        <ThinkingIndicator />
                    )}
                </div>
            </div>
        </div>
    );
}
