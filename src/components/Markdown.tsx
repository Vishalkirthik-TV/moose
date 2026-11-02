import { isValidElement, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';

interface MarkdownProps {
    content: string;
}

/**
 * Renders AI answers as polished Markdown:
 * headings, tables (GFM), lists, blockquotes, hr, links,
 * inline code and highlighted code blocks with a copy button.
 */
export function Markdown({ content }: MarkdownProps) {
    return (
        <div className="text-[0.975rem] leading-7 text-foreground">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // ---- Headings ----
                    h1: ({ children }) => (
                        <h1 className="mb-3 mt-6 text-xl font-semibold tracking-[-0.02em] first:mt-0">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="mb-2.5 mt-5 text-lg font-semibold tracking-[-0.015em] first:mt-0">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="mb-2 mt-4 text-base font-semibold first:mt-0">{children}</h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="mb-1.5 mt-3.5 text-sm font-semibold text-muted-foreground first:mt-0">
                            {children}
                        </h4>
                    ),

                    // ---- Paragraphs & line breaks ----
                    p: ({ children }) => <p className="my-3 first:mt-0 last:mb-0">{children}</p>,

                    // ---- Lists ----
                    ul: ({ children }) => (
                        <ul className="my-3 list-disc space-y-1.5 pl-6 marker:text-primary">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="my-3 list-decimal space-y-1.5 pl-6 marker:font-medium marker:text-primary">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="pl-1 [&>p]:my-1 [&>ul]:my-1.5 [&>ol]:my-1.5">{children}</li>
                    ),

                    // ---- Links ----
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary"
                        >
                            {children}
                        </a>
                    ),

                    // ---- Emphasis ----
                    strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">{children}</strong>
                    ),
                    em: ({ children }) => <em className="italic">{children}</em>,
                    del: ({ children }) => (
                        <del className="text-muted-foreground/70">{children}</del>
                    ),

                    // ---- Blockquote ----
                    blockquote: ({ children }) => (
                        <blockquote className="my-4 rounded-r-xl border-l-2 border-primary/50 bg-muted/60 px-4 py-2.5 text-muted-foreground [&>p]:my-1">
                            {children}
                        </blockquote>
                    ),

                    // ---- Horizontal rule ----
                    hr: () => <hr className="my-6 border-border/70" />,

                    // ---- Tables (GFM) ----
                    table: ({ children }) => (
                        <div className="my-4 overflow-x-auto rounded-xl border border-border/60">
                            <table className="w-full border-collapse text-sm">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-muted/70">{children}</thead>
                    ),
                    th: ({ children }) => (
                        <th className="border-b border-border/60 px-4 py-2.5 text-left font-semibold text-foreground">
                            {children}
                        </th>
                    ),
                    tr: ({ children }) => (
                        <tr className="transition-colors even:bg-muted/30 hover:bg-muted/50">{children}</tr>
                    ),
                    td: ({ children }) => (
                        <td className="border-b border-border/40 px-4 py-2.5 align-top text-muted-foreground last:border-b-0 [&:first-child]:font-medium [&:first-child]:text-foreground">
                            {children}
                        </td>
                    ),

                    // ---- Code (inline only; fenced blocks are handled by <pre>) ----
                    code: ({ children, ...props }) => (
                        <code
                            className="rounded-md border border-border/50 bg-muted/70 px-1.5 py-0.5 font-mono text-[0.85em] text-primary"
                            {...props}
                        >
                            {children}
                        </code>
                    ),

                    // ---- Fenced code block: <pre><code class="language-x">...</code></pre> ----
                    pre: ({ children }) => {
                        const child = Array.isArray(children) ? children[0] : children;
                        if (isValidElement<{ className?: string; children?: ReactNode }>(child)) {
                            const { className, children: codeChildren } = child.props;
                            const language = /language-(\w+)/.exec(className ?? '')?.[1];
                            const code = String(codeChildren ?? '').replace(/\n$/, '');
                            return <CodeBlock code={code} language={language} />;
                        }
                        return <div className="my-4">{children}</div>;
                    },

                    // ---- Task list checkboxes ----
                    input: ({ type, checked }) =>
                        type === 'checkbox' ? (
                            <input
                                type="checkbox"
                                checked={checked}
                                disabled
                                className="mr-2 h-3.5 w-3.5 rounded border-border accent-primary"
                            />
                        ) : null,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
