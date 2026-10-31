import { FiMenu, FiSidebar } from 'react-icons/fi';
import { Button } from './ui/button';

interface HeaderProps {
    onMenuClick?: () => void;
    onDesktopToggle?: () => void;
    isDesktopSidebarCollapsed?: boolean;
}

export function Header({ onMenuClick, onDesktopToggle, isDesktopSidebarCollapsed }: HeaderProps) {
    return (
        <header className={`sticky top-0 z-30 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl ${!isDesktopSidebarCollapsed ? 'md:hidden' : ''}`}>
            <div className="flex h-11 items-center justify-between px-3 sm:px-5">
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Mobile menu button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden h-8 w-8 sm:h-9 sm:w-9"
                        onClick={onMenuClick}
                    >
                        <FiMenu className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>

                    {/* Desktop sidebar toggle - only visible when sidebar is collapsed */}
                    {isDesktopSidebarCollapsed && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden md:flex h-8 w-8 sm:h-9 sm:w-9"
                            onClick={onDesktopToggle}
                            title="Expand sidebar"
                        >
                            <FiSidebar className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                    )}

                </div>
            </div>
        </header>
    );
}
