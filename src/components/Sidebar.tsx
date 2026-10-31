import { useState } from 'react';
import {
    FiPlus,
    FiMessageSquare,
    FiTrash2,
    FiHome,
    FiCompass,
    FiChevronsLeft,
    FiChevronsRight,
    FiLayers,
    FiSettings,
    FiDownload,
} from 'react-icons/fi';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { useChatStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { MooseLogo } from './MooseLogo';
import { AppDialog } from './AppDialog';

interface SidebarProps {
    isMobileOpen?: boolean;
    isDesktopCollapsed?: boolean;
    onMobileClose?: () => void;
    onDesktopToggle?: () => void;
    onDownload?: () => void;
}

export function Sidebar({
    isMobileOpen = false,
    isDesktopCollapsed = false,
    onMobileClose,
    onDesktopToggle,
    onDownload,
}: SidebarProps) {
    const [conversationToDelete, setConversationToDelete] = useState<{ id: string; title: string } | null>(null);
    const {
        conversations,
        spaces,
        activeConversationId,
        createConversation,
        setActiveConversation,
        deleteConversation,
    } = useChatStore();

    const handleNewChat = () => {
        createConversation();
        handleNavigation('#/chat');
    };

    const handleSelectConversation = (id: string) => {
        setActiveConversation(id);
        handleNavigation('#/chat');
    };

    const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const conversation = conversations.find((item) => item.id === id);
        if (conversation) setConversationToDelete({ id, title: conversation.title });
    };

    const confirmDeleteConversation = () => {
        if (!conversationToDelete) return;
        deleteConversation(conversationToDelete.id);
        setConversationToDelete(null);
    };

    const handleNavigation = (hash: string) => {
        window.location.assign(hash);
        onMobileClose?.();
    };

    return (
        <>
            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed md:relative inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl transition-all duration-300 ease-in-out',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full',
                    'md:translate-x-0',
                    isDesktopCollapsed ? 'md:w-16' : 'md:w-60',
                    'w-64'
                )}
            >
                {/* Logo & Collapse Toggle */}
                <div className="flex flex-shrink-0 items-center justify-between border-b border-sidebar-border px-3 py-3.5">
                    <div className={cn(
                        "transition-opacity duration-200",
                        isDesktopCollapsed ? "md:opacity-0 md:w-0 overflow-hidden" : "md:opacity-100"
                    )}>
                        <MooseLogo size="sm" showText />
                    </div>
                    <Button
                        onClick={onDesktopToggle}
                        className="hidden h-8 w-8 text-muted-foreground hover:text-foreground md:flex"
                        variant="ghost"
                        size="icon"
                        title={isDesktopCollapsed ? "Expand" : "Collapse"}
                    >
                        {isDesktopCollapsed ? (
                            <FiChevronsRight className="w-4 h-4" />
                        ) : (
                            <FiChevronsLeft className="w-4 h-4" />
                        )}
                    </Button>
                </div>

                {/* Main Navigation */}
                <div className="flex-shrink-0 space-y-1 p-2.5">
                    <Button
                        onClick={handleNewChat}
                        className={cn(
                            "mb-2 h-10 w-full justify-start gap-3 rounded-xl border border-primary/15 bg-primary/10 text-sm text-primary hover:border-primary/25 hover:bg-primary/15 hover:text-primary active:scale-[0.99]",
                            isDesktopCollapsed && "md:h-10 md:w-10 md:justify-center md:rounded-xl md:px-0"
                        )}
                        variant="ghost"
                        title="New Thread"
                    >
                        <FiPlus className="w-4 h-4 flex-shrink-0" />
                        <span className={cn(isDesktopCollapsed && "md:hidden", "truncate")}>New Thread</span>
                    </Button>

                    <Button
                        onClick={() => handleNavigation('#/welcome')}
                        className={cn(
                            "h-9 w-full justify-start gap-3 rounded-xl text-sm text-muted-foreground hover:text-foreground",
                            isDesktopCollapsed && "md:justify-center md:px-0"
                        )}
                        variant="ghost"
                        title="Home"
                    >
                        <FiHome className="w-4 h-4 flex-shrink-0" />
                        <span className={cn(isDesktopCollapsed && "md:hidden", "truncate")}>Home</span>
                    </Button>

                    <Button
                        onClick={() => handleNavigation('#/discover')}
                        className={cn(
                            "h-9 w-full justify-start gap-3 rounded-xl text-sm text-muted-foreground hover:text-foreground",
                            isDesktopCollapsed && "md:justify-center md:px-0"
                        )}
                        variant="ghost"
                        title="Discover AI news"
                    >
                        <FiCompass className="w-4 h-4 flex-shrink-0" />
                        <span className={cn(isDesktopCollapsed && "md:hidden", "truncate")}>Discover</span>
                    </Button>

                    <Button
                        onClick={() => handleNavigation('#/spaces')}
                        className={cn(
                            "h-9 w-full justify-start gap-3 rounded-xl text-sm text-muted-foreground hover:text-foreground",
                            isDesktopCollapsed && "md:justify-center md:px-0"
                        )}
                        variant="ghost"
                        title="Spaces"
                    >
                        <FiLayers className="w-4 h-4 flex-shrink-0" />
                        <span className={cn(isDesktopCollapsed && "md:hidden", "truncate")}>Spaces</span>
                    </Button>

                </div>

                {/* Thread History */}
                <div className={cn(
                    "mt-3 flex min-h-0 flex-1 flex-col",
                    isDesktopCollapsed && "md:hidden"
                )}>
                    <div className="flex-shrink-0 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                        Threads
                    </div>

                    <ScrollArea className="flex-1 min-h-0 px-2">
                        <div className="space-y-3 pb-4">
                            {conversations.length === 0 ? (
                                <div className="px-3 py-6 text-center text-sm text-muted-foreground/50">
                                    No threads yet
                                </div>
                            ) : (
                                <>
                                    {[...spaces.map((space) => ({
                                        id: space.id,
                                        name: space.name,
                                        items: conversations.filter((conversation) => conversation.spaceId === space.id),
                                    })), {
                                        id: 'unorganized',
                                        name: 'Unorganized',
                                        items: conversations.filter((conversation) => !conversation.spaceId),
                                    }].filter((group) => group.items.length > 0).map((group) => (
                                        <section key={group.id} className="space-y-1">
                                            {spaces.length > 0 && (
                                                <h3 className="truncate px-3 pt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">
                                                    {group.name}
                                                </h3>
                                            )}
                                            {group.items.map((conversation) => (
                                                <div
                                                    key={conversation.id}
                                                    onClick={() => handleSelectConversation(conversation.id)}
                                                    className={cn(
                                                        'group flex cursor-pointer items-start gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors',
                                                        activeConversationId === conversation.id
                                                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                                            : 'text-muted-foreground hover:bg-sidebar-accent/65 hover:text-sidebar-foreground'
                                                    )}
                                                >
                                                    <FiMessageSquare className="mt-0.5 h-4 w-4 shrink-0" />
                                                    <span className="flex-1 break-words text-sm leading-relaxed">
                                                        {conversation.title}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 shrink-0 rounded-lg text-muted-foreground opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
                                                        onClick={(event) => handleDeleteConversation(conversation.id, event)}
                                                        title="Delete chat"
                                                        aria-label={`Delete ${conversation.title}`}
                                                    >
                                                        <FiTrash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </section>
                                    ))}
                                </>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Bottom Section (Footer) */}
                <div className="p-2 border-t border-sidebar-border mt-auto flex-shrink-0 space-y-1">
                    <Button
                        onClick={() => {
                            onDownload?.();
                            onMobileClose?.();
                        }}
                        className={cn(
                            "w-full gap-3 text-sm h-9 justify-start text-muted-foreground hover:text-foreground",
                            isDesktopCollapsed && "md:justify-center md:px-0"
                        )}
                        variant="ghost"
                        title="Download conversation"
                    >
                        <FiDownload className="w-4 h-4 flex-shrink-0" />
                        <span className={cn(isDesktopCollapsed && "md:hidden", "truncate")}>Download</span>
                    </Button>

                    <div className={cn("hidden md:block transition-all", isDesktopCollapsed && "hidden")}>
                        <div className="h-px bg-sidebar-border my-1 mx-2"></div>
                    </div>

                    <Button
                        onClick={() => handleNavigation('#/settings')}
                        className={cn(
                            "w-full gap-3 text-sm h-9 justify-start text-muted-foreground hover:text-foreground",
                            isDesktopCollapsed && "md:justify-center md:px-0"
                        )}
                        variant="ghost"
                        title="Settings & profile"
                    >
                        <FiSettings className="w-4 h-4 flex-shrink-0" />
                        <span className={cn(isDesktopCollapsed && "md:hidden", "truncate")}>Settings</span>
                    </Button>

                    <div className={cn(
                        "flex items-center justify-between px-2 py-2 mt-1",
                        isDesktopCollapsed && "hidden"
                    )}>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-foreground">Moose</span>
                            <span className="text-[10px] text-muted-foreground">AI search</span>
                        </div>
                        <MooseLogo size="sm" />
                    </div>
                </div>
            </aside>
            <AppDialog
                title="Delete this chat?"
                description={conversationToDelete?.title}
                open={conversationToDelete !== null}
                onClose={() => setConversationToDelete(null)}
            >
                <p className="text-sm leading-6 text-muted-foreground">
                    This chat and its messages will be permanently removed from your history.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => setConversationToDelete(null)}>
                        Keep chat
                    </Button>
                    <Button type="button" variant="destructive" className="rounded-xl" onClick={confirmDeleteConversation}>
                        Delete chat
                    </Button>
                </div>
            </AppDialog>
        </>
    );
}
