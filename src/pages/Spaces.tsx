import { useState, type FormEvent } from 'react';
import { FiFolder, FiMessageSquare, FiPlus, FiTrash2 } from 'react-icons/fi';
import { AppDialog } from '@/components/AppDialog';
import { WorkspaceLayout } from '@/components/WorkspaceLayout';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/lib/store';

export function Spaces() {
    const [name, setName] = useState('');
    const [spaceToDelete, setSpaceToDelete] = useState<{ id: string; name: string } | null>(null);
    const { spaces, conversations, createSpace, deleteSpace, assignConversationToSpace } = useChatStore();

    const handleCreateSpace = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) return;
        createSpace(trimmedName);
        setName('');
    };

    return (
        <WorkspaceLayout>
            <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <main className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
                    <p className="text-sm font-medium text-primary">Your library</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Spaces</h1>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                        Organize related conversations into spaces. Moving a chat here keeps it in your history.
                    </p>

                    <form onSubmit={handleCreateSpace} className="mt-8 flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-sm sm:flex-row">
                        <label htmlFor="space-name" className="sr-only">New space name</label>
                        <input
                            id="space-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Name a space, e.g. Research"
                            maxLength={60}
                            className="h-11 min-w-0 flex-1 rounded-xl border border-transparent bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring/50 focus:ring-2 focus:ring-ring/20"
                        />
                        <Button type="submit" disabled={!name.trim()} className="h-11 gap-2 rounded-xl px-5">
                            <FiPlus aria-hidden="true" className="h-4 w-4" />
                            Create space
                        </Button>
                    </form>

                    {spaces.length === 0 ? (
                        <div className="mt-8 rounded-3xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
                            <FiFolder aria-hidden="true" className="mx-auto h-8 w-8 text-primary/70" />
                            <h2 className="mt-4 font-semibold">A place for every project</h2>
                            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                                Create a space above, then move chats into it from the list below.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-8 grid gap-4 md:grid-cols-2">
                            {spaces.map((space) => {
                                const count = conversations.filter((conversation) => conversation.spaceId === space.id).length;
                                return (
                                    <section key={space.id} className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                    <FiFolder aria-hidden="true" className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h2 className="truncate font-semibold">{space.name}</h2>
                                                    <p className="mt-0.5 text-xs text-muted-foreground">{count} {count === 1 ? 'chat' : 'chats'}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setSpaceToDelete({ id: space.id, name: space.name })}
                                                aria-label={`Delete ${space.name} space`}
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                <FiTrash2 aria-hidden="true" className="h-4 w-4" />
                                            </button>
                                        </div>
                                        {count > 0 ? (
                                            <ul className="mt-4 space-y-2 border-t border-border/60 pt-3">
                                                {conversations.filter((conversation) => conversation.spaceId === space.id).map((conversation) => (
                                                    <li key={conversation.id} className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                                                        <FiMessageSquare aria-hidden="true" className="h-4 w-4 shrink-0" />
                                                        <span className="truncate">{conversation.title}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">No chats in this space yet.</p>
                                        )}
                                    </section>
                                );
                            })}
                        </div>
                    )}

                    <section className="mt-12">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold tracking-[-0.03em]">Organize chats</h2>
                                <p className="mt-1 text-sm text-muted-foreground">Choose a space for each conversation.</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{conversations.length} total</span>
                        </div>
                        {conversations.length === 0 ? (
                            <p className="mt-5 rounded-2xl bg-muted/50 p-5 text-sm text-muted-foreground">Your conversations will appear here.</p>
                        ) : (
                            <div className="mt-4 divide-y divide-border/60 rounded-2xl border border-border/70 bg-card px-4">
                                {conversations.map((conversation) => (
                                    <div key={conversation.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <FiMessageSquare aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            <span className="truncate text-sm font-medium">{conversation.title}</span>
                                        </div>
                                        <label className="sr-only" htmlFor={`space-for-${conversation.id}`}>Space for {conversation.title}</label>
                                        <select
                                            id={`space-for-${conversation.id}`}
                                            value={conversation.spaceId ?? ''}
                                            onChange={(event) => assignConversationToSpace(conversation.id, event.target.value || null)}
                                            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm sm:w-52"
                                        >
                                            <option value="">Unorganized</option>
                                            {spaces.map((space) => <option key={space.id} value={space.id}>{space.name}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>

            <AppDialog
                title="Delete this space?"
                description={spaceToDelete?.name}
                open={spaceToDelete !== null}
                onClose={() => setSpaceToDelete(null)}
            >
                <p className="text-sm leading-6 text-muted-foreground">
                    The space will be removed. Its chats will stay in your history as unorganized conversations.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => setSpaceToDelete(null)}>Keep space</Button>
                    <Button
                        type="button"
                        variant="destructive"
                        className="rounded-xl"
                        onClick={() => {
                            if (spaceToDelete) deleteSpace(spaceToDelete.id);
                            setSpaceToDelete(null);
                        }}
                    >
                        Delete space
                    </Button>
                </div>
            </AppDialog>
        </WorkspaceLayout>
    );
}
