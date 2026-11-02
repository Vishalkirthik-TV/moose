import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import {
    FiPlus,
    FiMessageSquare,
    FiTrash2,
    FiCompass,
    FiChevronsLeft,
    FiChevronsRight,
    FiLayers,
    FiSettings,
    FiDownload,
    FiLogOut,
} from 'react-icons/fi';
import { Button } from './ui/button';
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
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [signOutError, setSignOutError] = useState<string | null>(null);
    const { signOut } = useClerk();
    const {
        conversations,
        spaces,
        activeConversationId,
        createConversation,
        setActiveConversation,
        deleteConversation,
    } = useChatStore();
    const currentRoute = useLocation().pathname;
    const navigate = useNavigate();

    const navigationClass = (isActive: boolean) => cn(
        'group relative h-10 w-full justify-start gap-3 rounded-xl px-3 text-sm font-medium transition-[background-color,color,transform] duration-150 active:scale-[0.99]',
        isActive
            ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-sm before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-sidebar-primary'
            : 'text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-foreground',
        isDesktopCollapsed && 'md:justify-center md:px-0'
    );

    const handleNewChat = () => {
        createConversation();
        handleNavigation('/chat');
    };

    const handleSelectConversation = (id: string) => {
        setActiveConversation(id);
        handleNavigation('/chat');
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

    const handleNavigation = (path: string) => {
        navigate(path);
        onMobileClose?.();
    };

    const handleSignOut = async () => {
        setIsSigningOut(true);
        setSignOutError(null);
        try {
            await signOut({ redirectUrl: `${window.location.origin}/signin` });
        } catch (error) {
            console.error('Unable to sign out:', error);
            setSignOutError('Could not sign out. Please try again.');
            setIsSigningOut(false);
        }
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
                    'fixed md:relative inset-y-0 left-0 z-50 flex h-full min-h-0 flex-col border-r border-sidebar-border bg-sidebar/95 shadow-[18px_0_60px_-50px_rgba(20,35,27,0.5)] backdrop-blur-2xl transition-all duration-300 ease-in-out',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full',
                    'md:translate-x-0',
                    isDesktopCollapsed ? 'md:w-16' : 'md:w-64',
                    'w-64'
                )}
            >
                {/* Logo & Collapse Toggle */}
                <div className={cn('relative flex h-[4.5rem] flex-shrink-0 items-center justify-between border-b border-sidebar-border px-4', isDesktopCollapsed && 'md:justify-center md:px-2')}>
                    <Link
                        to="/"
                        aria-label="Moose home"
                        title="Moose home"
                        onClick={() => onMobileClose?.()}
                        className="min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <MooseLogo
                            size="sm"
                            showText
                            className={cn('font-semibold', isDesktopCollapsed && 'md:[&_span]:hidden')}
                        />
                    </Link>
                    <Button
                        onClick={onDesktopToggle}
                        className="hidden h-8 w-8 rounded-xl text-muted-foreground hover:bg-sidebar-accent hover:text-foreground md:flex"
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
                <div className="flex-shrink-0 space-y-1 p-3 pt-4">
                    <Button
                        onClick={handleNewChat}
                        className={cn(
                            "mb-3 h-11 w-full justify-start gap-3 rounded-2xl border border-primary/15 bg-primary text-sm font-medium text-primary-foreground shadow-[0_6px_18px_-10px_var(--primary)] transition-[transform,box-shadow,background-color] hover:bg-primary/90 hover:shadow-md active:scale-[0.98]",
                            isDesktopCollapsed && "md:mb-1 md:h-10 md:w-10 md:justify-center md:rounded-xl md:px-0"
                        )}
                        title="New Thread"
                    >
                        <FiPlus className="h-4 w-4 flex-shrink-0" />
                        <span className={cn(isDesktopCollapsed && "md:hidden", "truncate")}>New Thread</span>
                    </Button>

                    <p className={cn('px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/55', isDesktopCollapsed && 'md:hidden')}>
                        Workspace
                    </p>
                    <Button
                        onClick={() => handleNavigation('/discover')}
                        className={navigationClass(currentRoute === '/discover')}
                        variant="ghost"
                        title="Discover AI news"
                        aria-current={currentRoute === '/discover' ? 'page' : undefined}
                    >
                        <FiCompass className={cn('h-4 w-4 flex-shrink-0 transition-colors', currentRoute === '/discover' && 'text-primary')} />
                        <span className={cn(isDesktopCollapsed && "md:hidden", "truncate")}>Discover</span>
                    </Button>

                    <Button
                        onClick={() => handleNavigation('/spaces')}
                        className={navigationClass(currentRoute === '/spaces')}
                        variant="ghost"
                        title="Spaces"
                        aria-current={currentRoute === '/spaces' ? 'page' : undefined}
                    >
                        <FiLayers className={cn('h-4 w-4 flex-shrink-0 transition-colors', currentRoute === '/spaces' && 'text-primary')} />
                        <span className={cn(isDesktopCollapsed && "md:hidden", "truncate")}>Spaces</span>
                    </Button>

                </div>

                {/* Thread History */}
                <div className={cn(
                    "mt-3 flex min-h-0 flex-1 flex-col",
                    isDesktopCollapsed && "md:hidden"
                )}>
                    <div className="flex flex-shrink-0 items-center justify-between px-4 py-2">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/55">Your chats</span>
                        <span className="rounded-full bg-sidebar-accent px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground/80">
                            {conversations.length}
                        </span>
                    </div>

                    <div
                        role="region"
                        aria-label="Chat history"
                        tabIndex={0}
                        className="group min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40"
                    >
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
                                                    className={cn(
                                                        'group flex items-start gap-1 rounded-xl border border-transparent px-1.5 py-1 transition-[background-color,border-color] duration-150',
                                                        activeConversationId === conversation.id
                                                            ? 'border-primary/10 bg-sidebar-accent/90 text-sidebar-accent-foreground'
                                                            : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                                                    )}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSelectConversation(conversation.id)}
                                                        aria-current={activeConversationId === conversation.id ? 'page' : undefined}
                                                        className="flex min-w-0 flex-1 items-start gap-2.5 rounded-lg px-1.5 py-2 text-left text-sm"
                                                    >
                                                        <FiMessageSquare className={cn('mt-0.5 h-4 w-4 shrink-0', activeConversationId === conversation.id ? 'text-primary' : 'text-muted-foreground/65')} />
                                                        <span className="min-w-0 flex-1 break-words leading-relaxed">{conversation.title}</span>
                                                    </button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="mt-1 h-7 w-7 shrink-0 rounded-lg text-muted-foreground opacity-100 transition-[background-color,color,opacity] hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
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
                    </div>
                </div>

                {/* Bottom Section (Footer) */}
                <div className="mt-auto flex-shrink-0 space-y-1 border-t border-sidebar-border bg-sidebar/80 p-2 pt-3">
                    <Button
                        onClick={() => {
                            onDownload?.();
                            onMobileClose?.();
                        }}
                        className={cn(
                            "h-10 w-full justify-start gap-3 rounded-xl text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
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
                        onClick={() => handleNavigation('/settings')}
                        className={cn(
                            navigationClass(currentRoute === '/settings'),
                            isDesktopCollapsed && "md:justify-center md:px-0"
                        )}
                        variant="ghost"
                        title="Settings & profile"
                        aria-current={currentRoute === '/settings' ? 'page' : undefined}
                    >
                        <FiSettings className="w-4 h-4 flex-shrink-0" />
                        <span className={cn(isDesktopCollapsed && "md:hidden", "truncate")}>Settings</span>
                    </Button>

                    <Button
                        onClick={() => void handleSignOut()}
                        disabled={isSigningOut}
                        className={cn(
                            "h-10 w-full justify-start gap-3 rounded-xl text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-60",
                            isDesktopCollapsed && "md:justify-center md:px-0"
                        )}
                        variant="ghost"
                        title="Sign out"
                    >
                        <FiLogOut aria-hidden="true" className="h-4 w-4 flex-shrink-0" />
                        <span className={cn(isDesktopCollapsed && "md:hidden", "truncate")}>
                            {isSigningOut ? 'Signing out…' : 'Sign out'}
                        </span>
                    </Button>
                    {signOutError && (
                        <p className="px-3 py-1 text-xs text-destructive" role="alert">{signOutError}</p>
                    )}

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
