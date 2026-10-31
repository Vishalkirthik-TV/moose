import { useState, type ReactNode } from 'react';
import { FiFileText, FiPrinter } from 'react-icons/fi';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { AppDialog } from '@/components/AppDialog';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
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

interface WorkspaceLayoutProps {
    children: ReactNode;
    headerActions?: ReactNode;
    scrollable?: boolean;
}

export function WorkspaceLayout({ children, headerActions, scrollable = false }: WorkspaceLayoutProps) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);
    const conversations = useChatStore((state) => state.conversations);
    const activeConversationId = useChatStore((state) => state.activeConversationId);
    const [selectedExportConversationId, setSelectedExportConversationId] = useState('');
    const exportableConversations = conversations.filter((conversation) =>
        conversation.messages.some((message) => message.role !== 'system')
    );
    const selectedConversation = exportableConversations.find(
        (conversation) => conversation.id === selectedExportConversationId
    ) ?? null;
    const currentPath = window.location.hash.split('?')[0];
    const title = currentPath === '#/chat'
        ? conversations.find((conversation) => conversation.id === activeConversationId)?.title ?? 'New chat'
        : currentPath === '#/discover'
            ? 'Discover'
            : currentPath === '#/spaces'
                ? 'Spaces'
                : currentPath === '#/settings'
                    ? 'Settings'
                    : 'Workspace';
    const subtitle = currentPath === '#/chat' ? 'A thoughtful space for your questions' : 'Your Moose workspace';

    const closeExportDialog = () => {
        setIsExportDialogOpen(false);
        setExportError(null);
    };

    const exportText = () => {
        if (!selectedConversation) return;

        const file = new Blob([conversationAsText(selectedConversation)], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        const safeTitle = selectedConversation.title
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
        if (!selectedConversation) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            setExportError('Allow pop-ups for Moose to print this conversation as a PDF.');
            return;
        }

        const messages = selectedConversation.messages
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
            <html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(selectedConversation.title)} — Moose</title>
            <style>
                body{font:15px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#202722;max-width:760px;margin:48px auto;padding:0 28px}
                header{border-bottom:1px solid #dfe5df;padding-bottom:18px;margin-bottom:28px}
                h1{font-size:24px;letter-spacing:-.03em;margin:0 0 5px}header p{color:#68736b;margin:0}
                article{padding:18px 0;border-bottom:1px solid #e8ece8;break-inside:avoid}
                h2{font-size:13px;color:#356b50;margin:0 0 8px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;margin:0}
                .sources{font-size:12px;color:#68736b}.sources a{color:#356b50}
                @media print{body{margin:0 auto;padding:0 10px}a{color:inherit}}
            </style></head><body>
            <header><h1>${escapeHtml(selectedConversation.title)}</h1><p>Exported from Moose</p></header>
            ${messages}
            <script>window.addEventListener('load',()=>setTimeout(()=>window.print(),150));</script>
            </body></html>`);
        printWindow.document.close();
        closeExportDialog();
    };

    return (
        <div className="fixed inset-0 flex overflow-hidden overscroll-none bg-background pb-[env(safe-area-inset-bottom)]">
            <Sidebar
                isMobileOpen={isMobileSidebarOpen}
                isDesktopCollapsed={isDesktopSidebarCollapsed}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
                onDesktopToggle={() => setIsDesktopSidebarCollapsed((collapsed) => !collapsed)}
                onDownload={() => {
                    setExportError(null);
                    const preferredConversation = exportableConversations.find(
                        (conversation) => conversation.id === activeConversationId
                    ) ?? exportableConversations[0];
                    setSelectedExportConversationId(preferredConversation?.id ?? '');
                    setIsExportDialogOpen(true);
                }}
            />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <Header
                    onMenuClick={() => setIsMobileSidebarOpen(true)}
                    onDesktopToggle={() => setIsDesktopSidebarCollapsed((collapsed) => !collapsed)}
                    isDesktopSidebarCollapsed={isDesktopSidebarCollapsed}
                    title={title}
                    subtitle={subtitle}
                    actions={headerActions}
                    variant={scrollable ? 'breadcrumb' : 'chat'}
                />
                <main className={scrollable
                    ? 'min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain'
                    : 'flex min-h-0 flex-1 flex-col overflow-hidden'
                }>
                    {children}
                </main>
                <div className="shrink-0">
                    <Footer />
                </div>
            </div>

            <AppDialog
                title="Export conversation"
                description="Choose a saved chat and a format to export it."
                open={isExportDialogOpen}
                onClose={closeExportDialog}
            >
                {exportableConversations.length > 0 ? (
                    <div className="space-y-4">
                        <label htmlFor="export-conversation" className="block text-sm font-medium text-foreground">
                            Chat to export
                        </label>
                        <Select
                            id="export-conversation"
                            value={selectedExportConversationId}
                            aria-label="Chat to export"
                            onValueChange={(conversationId) => {
                                setSelectedExportConversationId(conversationId);
                                setExportError(null);
                            }}
                            options={exportableConversations.map((conversation) => ({
                                value: conversation.id,
                                label: conversation.title,
                            }))}
                        />
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
                    </div>
                ) : (
                    <p className="rounded-2xl bg-muted/70 p-4 text-sm leading-6 text-muted-foreground">
                        There are no saved chats with messages to export yet. Start a conversation and it will appear here.
                    </p>
                )}
                {exportError && <p className="mt-4 text-sm text-destructive" role="alert">{exportError}</p>}
            </AppDialog>
        </div>
    );
}
