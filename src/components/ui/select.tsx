import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { FiCheck, FiChevronDown, FiSearch } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface SelectOption {
    value: string;
    label: string;
    badge?: 'Free' | 'Paid';
}

interface SelectProps {
    id?: string;
    value: string;
    options: SelectOption[];
    onValueChange: (value: string) => void;
    className?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
    'aria-label'?: string;
}

interface MenuPosition {
    top: number;
    left: number;
    width: number;
    maxHeight: number;
}

function Select({
    id,
    value,
    options,
    onValueChange,
    className,
    searchable = false,
    searchPlaceholder = 'Search…',
    'aria-label': ariaLabel,
}: SelectProps) {
    const generatedId = useId();
    const triggerId = id ?? generatedId;
    const listboxId = `${triggerId}-listbox`;
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listboxRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
    const filteredOptions = searchable && normalizedQuery
        ? options.filter((option) => `${option.label} ${option.value}`.toLocaleLowerCase().includes(normalizedQuery))
        : options;
    const selectedIndex = Math.max(0, filteredOptions.findIndex((option) => option.value === value));
    const [activeIndex, setActiveIndex] = useState(0);
    const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
    const selectedOption = options.find((option) => option.value === value);

    useLayoutEffect(() => {
        if (!isOpen) return;

        const updateMenuPosition = () => {
            const trigger = triggerRef.current;
            if (!trigger) return;

            const bounds = trigger.getBoundingClientRect();
            const below = window.innerHeight - bounds.bottom - 8;
            const above = bounds.top - 8;
            const openAbove = below < 180 && above > below;
            const maxHeight = Math.max(100, Math.min(240, openAbove ? above : below));
            const menuHeight = Math.min(maxHeight, options.length * 38 + 12 + (searchable ? 58 : 0));

            setMenuPosition({
                top: openAbove ? Math.max(8, bounds.top - menuHeight - 6) : bounds.bottom + 6,
                left: Math.max(8, Math.min(bounds.left, window.innerWidth - bounds.width - 8)),
                width: bounds.width,
                maxHeight,
            });
        };

        updateMenuPosition();
        window.addEventListener('resize', updateMenuPosition);
        window.addEventListener('scroll', updateMenuPosition, true);
        return () => {
            window.removeEventListener('resize', updateMenuPosition);
            window.removeEventListener('scroll', updateMenuPosition, true);
        };
    }, [isOpen, options.length, searchable]);

    useEffect(() => {
        if (!isOpen) return;
        if (searchable) {
            searchInputRef.current?.focus();
        } else {
            optionRefs.current[activeIndex]?.focus();
        }
    }, [activeIndex, isOpen, searchable]);

    useEffect(() => {
        if (!isOpen) return;

        const closeOnOutsideClick = (event: PointerEvent) => {
            const target = event.target as Node;
            if (!rootRef.current?.contains(target) && !listboxRef.current?.contains(target)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };
        document.addEventListener('pointerdown', closeOnOutsideClick);
        return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
    }, [isOpen]);

    const openAt = (index: number) => {
        if (options.length === 0) return;
        setSearchQuery('');
        setActiveIndex(Math.min(index, options.length - 1));
        setIsOpen(true);
    };

    const selectOption = (option: SelectOption) => {
        onValueChange(option.value);
        setIsOpen(false);
        setSearchQuery('');
    };

    const closeMenu = () => {
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openAt(selectedIndex);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            openAt(options.length - 1);
        }
    };

    const handleOptionKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((index + 1) % filteredOptions.length);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((index - 1 + filteredOptions.length) % filteredOptions.length);
        } else if (event.key === 'Home') {
            event.preventDefault();
            setActiveIndex(0);
        } else if (event.key === 'End') {
            event.preventDefault();
            setActiveIndex(filteredOptions.length - 1);
        } else if (event.key === 'Escape' || event.key === 'Tab') {
            closeMenu();
            if (event.key === 'Escape') {
                event.preventDefault();
                document.getElementById(triggerId)?.focus();
            }
        }
    };

    const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowDown' && filteredOptions.length > 0) {
            event.preventDefault();
            setActiveIndex(Math.min(selectedIndex, filteredOptions.length - 1));
            optionRefs.current[Math.min(selectedIndex, filteredOptions.length - 1)]?.focus();
        } else if (event.key === 'ArrowUp' && filteredOptions.length > 0) {
            event.preventDefault();
            const index = Math.min(selectedIndex, filteredOptions.length - 1);
            setActiveIndex(index);
            optionRefs.current[index]?.focus();
        } else if (event.key === 'Enter' && filteredOptions[activeIndex]) {
            event.preventDefault();
            selectOption(filteredOptions[activeIndex]);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            closeMenu();
            triggerRef.current?.focus();
        }
    };

    return (
        <div ref={rootRef} className={cn('relative w-full', className)}>
            <button
                ref={triggerRef}
                id={triggerId}
                type="button"
                role="combobox"
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={listboxId}
                onClick={() => isOpen ? closeMenu() : openAt(selectedIndex)}
                onKeyDown={handleTriggerKeyDown}
                className="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-input bg-card px-3.5 text-left text-sm text-foreground shadow-sm outline-none transition-[border-color,box-shadow,background-color] duration-150 hover:border-primary/35 focus:border-ring focus:ring-2 focus:ring-ring/20"
            >
                <span className="min-w-0 flex-1 truncate">{selectedOption?.label ?? ''}</span>
                {selectedOption?.badge && (
                    <span className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-4',
                        selectedOption.badge === 'Free'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                    )}>
                        {selectedOption.badge}
                    </span>
                )}
                <FiChevronDown
                    aria-hidden="true"
                    className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150', isOpen && 'rotate-180')}
                />
            </button>
            {isOpen && menuPosition && (
                <div
                    ref={(element) => {
                        listboxRef.current = element;
                        if (element && typeof element.showPopover === 'function' && !element.matches(':popover-open')) element.showPopover();
                    }}
                    popover="manual"
                    style={{
                        position: 'fixed',
                        top: menuPosition.top,
                        left: menuPosition.left,
                        width: menuPosition.width,
                        maxHeight: menuPosition.maxHeight,
                    }}
                    className="z-[100] m-0 flex flex-col overflow-hidden rounded-xl border border-border/80 bg-popover p-1.5 text-popover-foreground shadow-[0_16px_48px_-18px_rgba(0,0,0,0.38)] ring-1 ring-black/5"
                >
                    {searchable && (
                        <div className="relative shrink-0 border-b border-border/70 pb-1.5">
                            <FiSearch aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                ref={searchInputRef}
                                type="search"
                                value={searchQuery}
                                onChange={(event) => {
                                    setSearchQuery(event.target.value);
                                    setActiveIndex(0);
                                }}
                                onKeyDown={handleSearchKeyDown}
                                placeholder={searchPlaceholder}
                                aria-label={searchPlaceholder}
                                aria-controls={listboxId}
                                className="h-9 w-full rounded-lg bg-transparent pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                            />
                        </div>
                    )}
                    {filteredOptions.length > 0 ? (
                    <div
                        id={listboxId}
                        role="listbox"
                        aria-labelledby={triggerId}
                        className="overflow-y-auto overscroll-contain py-1"
                        style={{ maxHeight: `min(14rem, ${Math.max(4, (menuPosition?.maxHeight ?? 240) - (searchable ? 58 : 0))}px)` }}
                    >
                    {filteredOptions.map((option, index) => {
                        const selected = option.value === value;
                        return (
                            <button
                                key={option.value}
                                ref={(element) => { optionRefs.current[index] = element; }}
                                type="button"
                                role="option"
                                aria-selected={selected}
                                tabIndex={activeIndex === index ? 0 : -1}
                                onClick={() => selectOption(option)}
                                onFocus={() => setActiveIndex(index)}
                                onKeyDown={(event) => handleOptionKeyDown(event, index)}
                                className={cn(
                                    'flex min-h-9 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                                    selected
                                        ? 'bg-accent font-medium text-accent-foreground'
                                        : 'text-foreground/85 hover:bg-accent/70 hover:text-foreground'
                                )}
                            >
                                <span className="min-w-0 break-words">{option.label}</span>
                                <span className="flex shrink-0 items-center gap-2">
                                    {option.badge && (
                                        <span className={cn(
                                            'rounded-full px-2 py-0.5 text-[10px] font-semibold leading-4',
                                            option.badge === 'Free'
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-muted text-muted-foreground'
                                        )}>
                                            {option.badge}
                                        </span>
                                    )}
                                    {selected && <FiCheck aria-hidden="true" className="h-4 w-4 text-primary" />}
                                </span>
                            </button>
                        );
                    })}
                    </div>
                    ) : (
                        <p className="px-3 py-4 text-center text-xs text-muted-foreground" role="status">
                            No models match “{searchQuery}”.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export { Select };
