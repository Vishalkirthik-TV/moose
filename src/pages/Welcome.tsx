import { FiSun, FiMoon, FiZap, FiBookOpen, FiShield, FiArrowUpRight } from 'react-icons/fi';
import { UserButton } from '@clerk/clerk-react';
import { useChatStore } from '@/lib/store';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { MooseLogo } from '@/components/MooseLogo';
import { Footer } from '@/components/Footer';
import { ChatInput } from '@/components/ChatInput';

export function Welcome() {
    const { createConversation } = useChatStore();
    const { theme, toggleTheme } = useTheme();

    const handleStartChat = (prompt: string) => {
        if (!prompt.trim()) return;

        createConversation();
        window.location.hash = `#/chat?prompt=${encodeURIComponent(prompt.trim())}`;
    };

    return (
        <div className="relative flex min-h-svh flex-col overflow-x-hidden bg-background selection:bg-primary/20">
            <div aria-hidden="true" className="welcome-glow pointer-events-none absolute inset-x-0 top-0 -z-0 h-[34rem]" />
            <header className="relative z-10 flex w-full items-center justify-between border-b border-border/60 bg-background/75 px-4 py-3 backdrop-blur-xl sm:px-8 sm:py-4">
                <MooseLogo size="md" showText />
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} appearance`}
                        className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground"
                    >
                        {theme === 'dark' ? (
                            <FiSun aria-hidden="true" className="h-5 w-5" />
                        ) : (
                            <FiMoon aria-hidden="true" className="h-5 w-5" />
                        )}
                    </Button>
                    <UserButton afterSignOutUrl="/" />
                </div>
            </header>

            <main className="relative z-0 flex flex-1 flex-col items-center justify-center px-4 py-14 sm:px-8 sm:py-20">
                <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
                    <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-border/70 bg-card/80 shadow-sm">
                        <MooseLogo size="lg" />
                    </div>
                    <p className="mb-4 text-sm font-medium tracking-wide text-primary">A little wonder, a lot of answers.</p>
                    <h1 className="max-w-2xl text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-foreground sm:text-6xl">
                        Where curiosity leads.
                    </h1>
                    <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
                        Ask a question. Moose searches the web and brings the useful answers together.
                    </p>

                    <div className="mt-9 w-full">
                        <ChatInput onSend={handleStartChat} showHint={false} />
                    </div>

                    <div className="mt-5 flex w-full flex-wrap justify-center gap-2">
                        {['DeepSeek vs OpenAI', 'History of Rome', 'Python Asyncio', 'Best sci-fi movies'].map((topic) => (
                            <button
                                key={topic}
                                type="button"
                                onClick={() => handleStartChat(topic)}
                                className="group inline-flex min-h-10 items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-2 text-sm text-foreground/80 shadow-sm transition-[transform,border-color,background-color,color] duration-150 hover:border-primary/35 hover:bg-card hover:text-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                                {topic}
                                <FiArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
                            </button>
                        ))}
                    </div>

                    <div className="mt-16 grid w-full grid-cols-1 gap-3 border-t border-border/60 pt-8 text-left sm:grid-cols-3 sm:gap-4">
                        {[
                            { icon: FiZap, title: 'Current answers', detail: 'Find fresh information from the web.' },
                            { icon: FiBookOpen, title: 'Sources included', detail: 'Explore the links behind each answer.' },
                            { icon: FiShield, title: 'Your own space', detail: 'Keep your conversations together.' },
                        ].map(({ icon: Icon, title, detail }) => (
                            <div key={title} className="rounded-2xl border border-border/60 bg-card/65 p-4 transition-colors hover:bg-card sm:p-5">
                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Icon aria-hidden="true" className="h-5 w-5" />
                                </div>
                                <h2 className="text-sm font-semibold tracking-[-0.01em] text-foreground">{title}</h2>
                                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{detail}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
