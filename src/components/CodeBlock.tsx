import { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { FiCheck, FiCopy } from 'react-icons/fi';
import { useTheme } from '@/components/theme-provider';

interface CodeBlockProps {
    code: string;
    language?: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);
    const { theme } = useTheme();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard unavailable (permissions) — silently ignore
        }
    };

    return (
        <div className="my-4 overflow-hidden rounded-xl border border-border/60 bg-card">
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/60 px-4 py-2">
                <span className="font-mono text-xs font-medium text-muted-foreground">
                    {language || 'code'}
                </span>
                <button
                    type="button"
                    onClick={handleCopy}
                    aria-label={copied ? 'Code copied' : 'Copy code'}
                    className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-background/70 hover:text-foreground active:scale-[0.97]"
                >
                    {copied ? (
                        <FiCheck className="h-3.5 w-3.5 text-primary" />
                    ) : (
                        <FiCopy className="h-3.5 w-3.5" />
                    )}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <SyntaxHighlighter
                    language={language || 'text'}
                    style={theme === 'dark' ? atomOneDark : docco}
                    customStyle={{
                        margin: 0,
                        padding: '1rem 1.25rem',
                        background: 'transparent',
                        fontSize: '0.875rem',
                        lineHeight: '1.6',
                    }}
                    wrapLongLines={false}
                    PreTag="div"
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}
