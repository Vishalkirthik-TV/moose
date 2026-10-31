import { useState, type ReactNode } from 'react';
import { FiFileText, FiPrinter } from 'react-icons/fi';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { AppDialog } from '@/components/AppDialog';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';
import { useChatStore, type Conversation } from '@/lib/store';

function escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    })[character] ?? character);
}

function conversationAsText(conversation: Conversation) {
    return [
        `Moose conversation: ${conversation.title}`,
        '',
        ...conversation.messages
            .filter((message) => message.role !== 'system')
            .map((message) => `${message.role === 'user' ? 'You' : 'Moose'}\n${message.content}`),
    ].join('\n\n');
}

function safeExternalUrl(value: string) {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
    } catch {
        return null;
    }
}

export function WorkspaceLayout({ children }: { children: ReactNode }) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);
    const activeConversation = useChatStore((state) =>
        state.conversations.find((conversation) => conversation.id === state.activeConversationId) ?? null
    );

    const closeExportDialog = () => {
        setIsExportDialogOpen(false);
        setExportError(null);
    };

    const exportText = () => {
        if (!activeConversation) return;

        const file = new Blob([conversationAsText(activeConversation)], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        const safeTitle = activeConversation.title
            .replace(/[<>:"/\\|?*]/g, '-')
            .split('')
            .filter((character) => character.charCodeAt(0) >= 32)
            .join('')
            .slice(0, 80);
        link.download = `${safeTitle || 'moose-chat'}.txt`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        closeExportDialog();
    };

    const exportPdf = () => {
        if (!activeConversation) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            setExportError('Allow pop-ups for Moose to print this conversation as a PDF.');
            return;
        }

        const messages = activeConversation.messages
            .filter((message) => message.role !== 'system')
            .map((message) => `
                <article class="${message.role}">
                    <h2>${message.role === 'user' ? 'You' : 'Moose'}</h2>
                    <pre>${escapeHtml(message.content)}</pre>
                    ${message.sources?.length ? `<p class="sources">Sources: ${message.sources.map((source) => {
                        const sourceUrl = safeExternalUrl(source.link);
                        return sourceUrl ? `<a href="${escapeHtml(sourceUrl)}">${escapeHtml(source.title)}</a>` : escapeHtml(source.title);
                    }).join(' · ')}</p>` : ''}
                </article>
            `).join('');

        printWindow.document.write(`<!doctype html>
            <html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(activeConversation.title)} — Moose</title>
            <style>
                body{font:15px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#202722;max-width:760px;margin:48px auto;padding:0 28px}
                header{border-bottom:1px solid #dfe5df;padding-bottom:18px;margin-bottom:28px}
                h1{font-size:24px;letter-spacing:-.03em;margin:0 0 5px}header p{color:#68736b;margin:0}
                article{padding:18px 0;border-bottom:1px solid #e8ece8;break-inside:avoid}
                h2{font-size:13px;color:#356b50;margin:0 0 8px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;margin:0}
                .sources{font-size:12px;color:#68736b}.sources a{color:#356b50}
                @media print{body{margin:0 auto;padding:0 10px}a{color:inherit}}
            </style></head><body>
            <header><h1>${escapeHtml(activeConversation.title)}</h1><p>Exported from Moose</p></header>
            ${messages}
            <script>window.addEventListener('load',()=>setTimeout(()=>window.print(),150));</script>
            </body></html>`);
        printWindow.document.close();
        closeExportDialog();
    };

    return (
        <div className="flex h-dvh overflow-hidden bg-background pb-[env(safe-area-inset-bottom)]">
            <Sidebar
                isMobileOpen={isMobileSidebarOpen}
                isDesktopCollapsed={isDesktopSidebarCollapsed}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
                onDesktopToggle={() => setIsDesktopSidebarCollapsed((collapsed) => !collapsed)}
                onDownload={() => {
                    setExportError(null);
                    setIsExportDialogOpen(true);
                }}
            />
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Header
                    onMenuClick={() => setIsMobileSidebarOpen(true)}
                    onDesktopToggle={() => setIsDesktopSidebarCollapsed((collapsed) => !collapsed)}
                    isDesktopSidebarCollapsed={isDesktopSidebarCollapsed}
                />
                <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
                <Footer />
            </div>

            <AppDialog
                title="Export conversation"
                description={activeConversation?.title ?? 'Choose a format to save this conversation.'}
                open={isExportDialogOpen}
                onClose={closeExportDialog}
            >
                {activeConversation?.messages.some((message) => message.role !== 'system') ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Button
                            onClick={exportPdf}
                            variant="outline"
                            className="h-auto min-h-28 flex-col items-start justify-between gap-5 rounded-2xl p-4 text-left whitespace-normal"
                        >
                            <FiPrinter aria-hidden="true" className="h-5 w-5 text-primary" />
                            <span><span className="block font-semibold">Save as PDF</span><span className="mt-1 block text-xs font-normal text-muted-foreground">Open the print dialog and choose Save as PDF.</span></span>
                        </Button>
                        <Button
                            onClick={exportText}
                            variant="outline"
                            className="h-auto min-h-28 flex-col items-start justify-between gap-5 rounded-2xl p-4 text-left whitespace-normal"
                        >
                            <FiFileText aria-hidden="true" className="h-5 w-5 text-primary" />
                            <span><span className="block font-semibold">Download text</span><span className="mt-1 block text-xs font-normal text-muted-foreground">Save the conversation as a plain-text file.</span></span>
                        </Button>
                    </div>
                ) : (
                    <p className="rounded-2xl bg-muted/70 p-4 text-sm text-muted-foreground">
                        Start a conversation before exporting it.
                    </p>
                )}
                {exportError && <p className="mt-4 text-sm text-destructive" role="alert">{exportError}</p>}
            </AppDialog>
        </div>
    );
}
