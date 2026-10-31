import { useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { FiArrowUp, FiSearch, FiLoader } from 'react-icons/fi';
import { Textarea } from './ui/textarea';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    showHint?: boolean;
}

export function ChatInput({ onSend, disabled = false, showHint = true }: ChatInputProps) {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useLayoutEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 192)}px`;
        textarea.style.overflowY = textarea.scrollHeight > 192 ? 'auto' : 'hidden';
    }, [message]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const prompt = message.trim();
        if (!prompt || disabled) return;

        onSend(prompt);
        setMessage('');
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
        }
    };

    return (
        <div className="w-full px-4 pb-3 pt-2 sm:px-6 sm:pb-4">
            <div className="mx-auto w-full max-w-3xl">
                <form
                    onSubmit={handleSubmit}
                    className="rounded-[1.65rem] border border-border/80 bg-card/95 p-2 shadow-[0_12px_40px_-24px_rgba(20,35,27,0.35)] backdrop-blur-xl transition-[border-color,box-shadow] duration-200 focus-within:border-primary/50 focus-within:shadow-[0_14px_44px_-22px_rgba(40,100,70,0.32)]"
                >
                    <div className="flex items-end gap-2">
                        <FiSearch aria-hidden="true" className="ml-2 mt-[0.85rem] h-5 w-5 shrink-0 self-start text-muted-foreground/65" />
                        <Textarea
                            ref={textareaRef}
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything..."
                            aria-label="Ask Moose a question"
                            disabled={disabled}
                            rows={1}
                            className="max-h-48 min-h-12 flex-1 resize-none border-0 bg-transparent px-2 py-3 text-base leading-6 shadow-none placeholder:text-muted-foreground/65 focus-visible:border-0 focus-visible:ring-0 disabled:opacity-60 md:text-base"
                        />
                        <button
                            type="submit"
                            disabled={disabled || !message.trim()}
                            aria-label={disabled ? 'Moose is responding' : 'Send message'}
                            className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-primary text-primary-foreground transition-[transform,background-color,opacity] duration-150 hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {disabled
                                ? <FiLoader aria-hidden="true" className="h-5 w-5 animate-spin motion-reduce:animate-none" />
                                : <FiArrowUp aria-hidden="true" className="h-5 w-5" />}
                        </button>
                    </div>
                </form>
                {showHint && (
                    <p className="mt-2 text-center text-xs text-muted-foreground/75">
                        Enter to send <span aria-hidden="true">·</span> Shift + Enter for a new line
                    </p>
                )}
            </div>
        </div>
    );
}
