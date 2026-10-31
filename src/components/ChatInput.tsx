import { useLayoutEffect, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react';
import {
    FiArrowUp,
    FiCheck,
    FiFileText,
    FiGlobe,
    FiGrid,
    FiImage,
    FiLoader,
    FiPlus,
    FiX,
    FiZap,
} from 'react-icons/fi';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import type { ProviderModel } from '@/lib/providers';

export interface ChatInputOptions {
    webSearchEnabled: boolean;
    thinkingEnabled: boolean;
    attachments: File[];
}

interface ChatInputProps {
    onSend: (message: string, options: ChatInputOptions) => void;
    disabled?: boolean;
    showHint?: boolean;
    defaultWebSearchEnabled?: boolean;
    defaultThinkingEnabled?: boolean;
    models?: ProviderModel[];
    modelId?: string;
    onModelChange?: (modelId: string) => void;
    modelsLoading?: boolean;
    supportsThinking?: boolean;
    modelError?: string | null;
}

const attachmentActions = [
    { id: 'media', label: 'Upload files or images', icon: FiImage, accept: 'image/*,.txt,.md,.pdf,.doc,.docx,.rtf' },
    { id: 'documents', label: 'Upload documents', icon: FiFileText, accept: '.pdf,.doc,.docx,.txt,.md,.rtf' },
    { id: 'spreadsheets', label: 'Upload spreadsheets', icon: FiGrid, accept: '.csv,.tsv,.xls,.xlsx,.ods' },
] as const;

export function ChatInput({
    onSend,
    disabled = false,
    showHint = true,
    defaultWebSearchEnabled = false,
    defaultThinkingEnabled = false,
    models = [],
    modelId = '',
    onModelChange,
    modelsLoading = false,
    supportsThinking,
    modelError,
}: ChatInputProps) {
    const [message, setMessage] = useState('');
    const [webSearchEnabled, setWebSearchEnabled] = useState(defaultWebSearchEnabled);
    const [thinkingPreference, setThinkingPreference] = useState(defaultThinkingEnabled);
    const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
    const canSubmit = !disabled && models.length > 0 && Boolean(modelId);

    const thinkingEnabled = supportsThinking !== false && thinkingPreference;

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
        if (!prompt || !canSubmit) return;

        onSend(prompt, { webSearchEnabled, thinkingEnabled: supportsThinking ? thinkingEnabled : false, attachments });
        setMessage('');
        setAttachments([]);
    };

    const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files ?? []);
        if (selectedFiles.length > 0) {
            setAttachments((current) => [...current, ...selectedFiles]);
        }
        event.target.value = '';
        setIsAttachmentMenuOpen(false);
        textareaRef.current?.focus();
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
                    className="flex min-h-[4.25rem] items-end gap-2 rounded-full border border-border/80 bg-card/95 p-2 shadow-[0_16px_48px_-28px_rgba(20,35,27,0.42)] backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-200 focus-within:-translate-y-0.5 focus-within:border-primary/45 focus-within:shadow-[0_18px_48px_-24px_rgba(40,100,70,0.34)]"
                >
                    <div className="relative mb-1 shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsAttachmentMenuOpen((open) => !open)}
                            aria-label="Add files or options"
                            aria-haspopup="menu"
                            aria-expanded={isAttachmentMenuOpen}
                            className={`flex h-10 w-10 items-center justify-center rounded-full transition-[background-color,color,transform] duration-150 active:scale-90 ${
                                isAttachmentMenuOpen
                                    ? 'bg-muted text-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <FiPlus aria-hidden="true" className={`h-5 w-5 transition-transform duration-150 ${isAttachmentMenuOpen ? 'rotate-45' : ''}`} />
                        </button>
                        {isAttachmentMenuOpen && (
                            <div
                                role="menu"
                                aria-label="Message options"
                                className="absolute bottom-[calc(100%+0.75rem)] left-0 z-50 w-64 rounded-2xl border border-border/80 bg-popover p-2 text-popover-foreground shadow-[0_18px_50px_-20px_rgba(0,0,0,0.42)]"
                            >
                                {attachmentActions.map(({ id, label, icon: Icon }) => (
                                    <button
                                        key={id}
                                        type="button"
                                        role="menuitem"
                                        onClick={() => fileInputRefs.current[id]?.click()}
                                        className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-foreground/90 transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                                    >
                                        <Icon aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                                        {label}
                                    </button>
                                ))}
                                {supportsThinking && (
                                    <>
                                        <div className="my-1.5 h-px bg-border/70" />
                                        <button
                                    type="button"
                                    role="menuitemcheckbox"
                                    aria-checked={thinkingEnabled}
                                    onClick={() => setThinkingPreference((enabled) => !enabled)}
                                    className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-foreground/90 transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                                >
                                    <FiZap aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                                    <span className="flex-1">Turn on thinking</span>
                                    {thinkingEnabled && <FiCheck aria-hidden="true" className="h-4 w-4 text-primary" />}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                        {attachmentActions.map(({ id, accept }) => (
                            <input
                                key={id}
                                ref={(element) => { fileInputRefs.current[id] = element; }}
                                type="file"
                                accept={accept}
                                multiple
                                tabIndex={-1}
                                aria-hidden="true"
                                className="hidden"
                                onChange={handleFilesSelected}
                            />
                        ))}
                    </div>
                    <Textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Moose anything"
                        aria-label="Ask Moose a question"
                        disabled={disabled}
                        rows={1}
                        className="max-h-48 min-h-10 flex-1 resize-none border-0 bg-transparent px-1 py-2.5 text-[15px] leading-6 shadow-none placeholder:text-muted-foreground/65 focus-visible:border-0 focus-visible:ring-0 disabled:opacity-60"
                    />
                    <div className="mb-1 flex shrink-0 items-center gap-1.5">
                        <button
                            type="button"
                            aria-pressed={webSearchEnabled}
                            aria-label={`Web search ${webSearchEnabled ? 'enabled' : 'disabled'}`}
                            title={`Web search ${webSearchEnabled ? 'on' : 'off'}`}
                            onClick={() => setWebSearchEnabled((enabled) => !enabled)}
                            className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-[background-color,color,transform] duration-150 active:scale-95 ${
                                webSearchEnabled
                                    ? 'bg-primary/12 text-primary hover:bg-primary/20'
                                    : 'bg-muted/75 text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <FiGlobe aria-hidden="true" className="h-4 w-4" />
                            <span className="hidden sm:inline">{webSearchEnabled ? 'Web on' : 'Web off'}</span>
                        </button>
                        <button
                            type="submit"
                            disabled={!canSubmit || !message.trim()}
                            aria-label={disabled ? 'Moose is responding' : 'Send message'}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-[transform,background-color,opacity] duration-150 hover:bg-primary/90 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {disabled
                                ? <FiLoader aria-hidden="true" className="h-5 w-5 animate-spin motion-reduce:animate-none" />
                                : <FiArrowUp aria-hidden="true" className="h-5 w-5" />}
                        </button>
                    </div>
                </form>
                <div className="mt-2 flex min-h-9 flex-wrap items-center justify-between gap-2 px-2">
                    <div className="flex min-w-0 items-center gap-2">
                        {models.length > 0 && onModelChange ? (
                            <Select
                                value={modelId}
                                options={models.map((model) => ({ value: model.id, label: model.name }))}
                                onValueChange={onModelChange}
                                aria-label="AI model"
                                className="w-[min(17rem,62vw)]"
                            />
                        ) : (
                            <span className="truncate text-xs text-muted-foreground" role={modelsLoading ? 'status' : undefined}>
                                {modelsLoading ? 'Loading models…' : 'No configured models'}
                            </span>
                        )}
                        {supportsThinking && (
                            <span className="hidden items-center gap-1 text-[11px] text-primary sm:inline-flex">
                                <FiZap aria-hidden="true" className="h-3.5 w-3.5" />
                                Reasoning supported
                            </span>
                        )}
                        {supportsThinking === false && models.length > 0 && (
                            <span className="hidden text-[11px] text-muted-foreground sm:inline">
                                Thinking unavailable for this model
                            </span>
                        )}
                    </div>
                    {modelError && <p className="text-xs text-destructive" role="alert">{modelError}</p>}
                </div>
                {attachments.length > 0 && (
                    <ul aria-label="Attached files" className="mt-2 flex flex-wrap gap-2">
                        {attachments.map((file, index) => (
                            <li key={`${file.name}-${file.lastModified}-${index}`} className="inline-flex max-w-full items-center gap-2 rounded-full border border-border/70 bg-card/90 py-1 pl-2.5 pr-1.5 text-xs text-muted-foreground shadow-sm">
                                <FiFileText aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-primary" />
                                <span className="max-w-48 truncate">{file.name}</span>
                                <button
                                    type="button"
                                    onClick={() => setAttachments((current) => current.filter((_, fileIndex) => fileIndex !== index))}
                                    aria-label={`Remove ${file.name}`}
                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted hover:text-foreground"
                                >
                                    <FiX aria-hidden="true" className="h-3.5 w-3.5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                {thinkingEnabled && supportsThinking && (
                    <p className="mt-2 text-center text-xs text-primary" role="status">Thinking mode is on</p>
                )}
                {showHint && (
                    <p className="mt-2 text-center text-xs text-muted-foreground/75">
                        Moose can make mistakes. Check important information.
                    </p>
                )}
            </div>
        </div>
    );
}
