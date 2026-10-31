import { useEffect, useId, useRef, type ReactNode } from 'react';
import { FiX } from 'react-icons/fi';

interface AppDialogProps {
    title: string;
    description?: string;
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    className?: string;
}

export function AppDialog({ title, description, open, onClose, children, className = '' }: AppDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            onClose={onClose}
            onClick={(event) => {
                if (event.target === event.currentTarget) dialogRef.current?.close();
            }}
            className={`m-auto max-h-[min(90dvh,48rem)] w-[min(92vw,36rem)] overflow-y-auto rounded-3xl border border-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm ${className}`}
        >
            <div className="flex items-start justify-between gap-5 border-b border-border/70 px-6 py-5">
                <div>
                    <h2 id={titleId} className="text-lg font-semibold tracking-[-0.02em]">{title}</h2>
                    {description && <p id={descriptionId} className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>}
                </div>
                <button
                    type="button"
                    aria-label="Close dialog"
                    onClick={() => dialogRef.current?.close()}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <FiX aria-hidden="true" className="h-4 w-4" />
                </button>
            </div>
            <div className="p-6">{children}</div>
        </dialog>
    );
}
