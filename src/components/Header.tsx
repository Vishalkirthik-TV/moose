import { FiChevronRight, FiHome, FiMenu, FiSidebar } from 'react-icons/fi';
import { Button } from './ui/button';
import type { ReactNode } from 'react';

interface HeaderProps {
    onMenuClick?: () => void;
    onDesktopToggle?: () => void;
    isDesktopSidebarCollapsed?: boolean;
    title?: string;
    subtitle?: string;
    actions?: ReactNode;
    variant?: 'chat' | 'breadcrumb';
}

export function Header({
    onMenuClick,
    onDesktopToggle,
    isDesktopSidebarCollapsed,
    title = 'Moose',
    subtitle = 'Your AI workspace',
    actions,
    variant = 'chat',
}: HeaderProps) {
    const isChatHeader = variant === 'chat';

    return (
        <header className={`sticky top-0 z-30 w-full ${isChatHeader ? 'bg-background/80 backdrop-blur-2xl' : 'bg-gradient-to-b from-background/65 to-transparent'}`}>
            <div className={`flex items-center justify-between gap-3 px-3 sm:px-5 ${isChatHeader ? 'h-[3.75rem]' : 'h-12'}`}>
                <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Open navigation"
                        className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground md:hidden"
                        onClick={onMenuClick}
                    >
                        <FiMenu className="h-4 w-4" />
                    </Button>

                    {isDesktopSidebarCollapsed && (
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Expand sidebar"
                            className="hidden h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground md:flex"
                            onClick={onDesktopToggle}
                        >
                            <FiSidebar className="h-4 w-4" />
                        </Button>
                    )}
                    {isChatHeader ? (
                        <div className="min-w-0">
                            <h1 className="truncate text-sm font-semibold tracking-[-0.015em] text-foreground sm:text-[15px]">{title}</h1>
                            <p className="hidden truncate text-[11px] text-muted-foreground sm:block">{subtitle}</p>
                        </div>
                    ) : (
                        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
                            <a
                                href="#/welcome"
                                className="flex shrink-0 items-center gap-1.5 rounded-lg py-1 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <FiHome aria-hidden="true" className="h-3.5 w-3.5" />
                                <span>Home</span>
                            </a>
                            <FiChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                            <span aria-current="page" className="truncate font-medium text-foreground">{title}</span>
                        </nav>
                    )}
                </div>
                {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
            </div>
        </header>
    );
}
