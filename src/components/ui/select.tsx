import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { FiCheck, FiChevronDown } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    id?: string;
    value: string;
    options: SelectOption[];
    onValueChange: (value: string) => void;
    className?: string;
    'aria-label'?: string;
}

interface MenuPosition {
    top: number;
    left: number;
    width: number;
    maxHeight: number;
}

function Select({ id, value, options, onValueChange, className, 'aria-label': ariaLabel }: SelectProps) {
    const generatedId = useId();
    const triggerId = id ?? generatedId;
    const listboxId = `${triggerId}-listbox`;
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listboxRef = useRef<HTMLDivElement>(null);
    const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(selectedIndex);
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
            const menuHeight = Math.min(maxHeight, options.length * 38 + 12);

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
    }, [isOpen, options.length]);

    useEffect(() => {
        if (isOpen) optionRefs.current[activeIndex]?.focus();
    }, [activeIndex, isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const closeOnOutsideClick = (event: PointerEvent) => {
            const target = event.target as Node;
            if (!rootRef.current?.contains(target) && !listboxRef.current?.contains(target)) setIsOpen(false);
        };
        document.addEventListener('pointerdown', closeOnOutsideClick);
        return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
    }, [isOpen]);

    const openAt = (index: number) => {
        if (options.length === 0) return;
        setActiveIndex(index);
        setIsOpen(true);
    };

    const selectOption = (option: SelectOption) => {
        onValueChange(option.value);
        setIsOpen(false);
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
            setActiveIndex((index + 1) % options.length);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((index - 1 + options.length) % options.length);
        } else if (event.key === 'Home') {
            event.preventDefault();
            setActiveIndex(0);
        } else if (event.key === 'End') {
            event.preventDefault();
            setActiveIndex(options.length - 1);
        } else if (event.key === 'Escape' || event.key === 'Tab') {
            setIsOpen(false);
            if (event.key === 'Escape') {
                event.preventDefault();
                document.getElementById(triggerId)?.focus();
            }
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
                onClick={() => isOpen ? setIsOpen(false) : openAt(selectedIndex)}
                onKeyDown={handleTriggerKeyDown}
                className="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-input bg-card px-3.5 text-left text-sm text-foreground shadow-sm outline-none transition-[border-color,box-shadow,background-color] duration-150 hover:border-primary/35 focus:border-ring focus:ring-2 focus:ring-ring/20"
            >
                <span className="min-w-0 truncate">{selectedOption?.label ?? ''}</span>
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
                    id={listboxId}
                    role="listbox"
                    popover="manual"
                    aria-labelledby={triggerId}
                    style={{
                        position: 'fixed',
                        top: menuPosition.top,
                        left: menuPosition.left,
                        width: menuPosition.width,
                        maxHeight: menuPosition.maxHeight,
                    }}
                    className="z-[100] m-0 overflow-y-auto rounded-xl border border-border/80 bg-popover p-1.5 text-popover-foreground shadow-[0_16px_48px_-18px_rgba(0,0,0,0.38)] ring-1 ring-black/5"
                >
                    {options.map((option, index) => {
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
                                {selected && <FiCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export { Select };
