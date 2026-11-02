import {
    FiArrowUpRight,
    FiBookOpen,
    FiCode,
    FiCompass,
    FiGlobe,
    FiMoon,
    FiSun,
    FiTrendingUp,
    FiZap,
} from 'react-icons/fi';
import { motion, useReducedMotion } from 'framer-motion';
import { UserButton } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { useChatStore } from '@/lib/store';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { MooseLogo } from '@/components/MooseLogo';
import { Footer } from '@/components/Footer';

const promptIdeas = [
    { icon: FiGlobe, label: 'Understand the world', prompt: 'What is one recent scientific discovery that could change everyday life?' },
    { icon: FiCode, label: 'Make something', prompt: 'Show me how to build a simple habit tracker with React.' },
    { icon: FiBookOpen, label: 'Go deeper', prompt: 'Why did the Roman Republic fall, and what replaced it?' },
    { icon: FiTrendingUp, label: 'Choose with confidence', prompt: 'Compare electric and hybrid cars for a long daily commute.' },
];

export function Welcome() {
    const { createConversation } = useChatStore();
    const { theme, toggleTheme } = useTheme();
    const prefersReducedMotion = useReducedMotion();
    const navigate = useNavigate();

    const handleStartChat = (prompt: string) => {
        if (!prompt.trim()) return;

        createConversation();
        navigate(`/chat?prompt=${encodeURIComponent(prompt.trim())}`);
    };

    const handleExplore = () => {
        createConversation();
        navigate('/chat');
    };

    return (
        <div className="relative flex min-h-svh flex-col overflow-x-hidden bg-background selection:bg-primary/20">
            <div aria-hidden="true" className="welcome-hero-glow pointer-events-none absolute inset-0" />
            <div aria-hidden="true" className="welcome-hero-grid pointer-events-none absolute inset-0" />
            <header className="sticky top-0 z-30 w-full border-b border-border/50 bg-background/60 backdrop-blur-2xl">
                <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-8">
                    <Link to="/" aria-label="Moose home" className="shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <MooseLogo size="md" showText />
                    </Link>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { navigate('/discover'); }}
                            aria-label="Discover AI news"
                            className="h-9 gap-2 rounded-full border border-transparent px-3 text-muted-foreground transition-colors hover:border-border/60 hover:bg-card/70 hover:text-foreground sm:px-4"
                        >
                            <FiCompass aria-hidden="true" className="h-4 w-4" />
                            <span className="hidden sm:inline">Discover</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} appearance`}
                            className="h-9 w-9 rounded-full border border-transparent text-muted-foreground transition-colors hover:border-border/60 hover:bg-card/70 hover:text-foreground"
                        >
                            {theme === 'dark' ? (
                                <FiSun aria-hidden="true" className="h-4 w-4" />
                            ) : (
                                <FiMoon aria-hidden="true" className="h-4 w-4" />
                            )}
                        </Button>
                        <div className="ml-1.5 border-l border-border/60 pl-3">
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="relative z-0 flex flex-1 flex-col px-4 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-14">
                <section aria-labelledby="welcome-heading" className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 py-8 lg:grid-cols-[1fr_0.95fr] lg:gap-16">
                    <motion.div
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                        className="text-center lg:text-left"
                    >
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/65 px-3.5 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/35 motion-reduce:animate-none" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                            </span>
                            A little wonder, a lot of answers
                        </div>
                        <h1 id="welcome-heading" className="mx-auto max-w-2xl text-balance text-[2.75rem] font-semibold leading-[1.03] tracking-[-0.065em] text-foreground sm:text-6xl lg:mx-0 lg:text-7xl">
                            The world is full of questions.
                            <span className="mt-1 block bg-gradient-to-r from-primary via-primary to-foreground/75 bg-clip-text pb-2 text-transparent">
                                Find your way to answers.
                            </span>
                        </h1>
                        <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:mt-6 sm:text-lg sm:leading-8 lg:mx-0">
                            A thoughtful AI companion for the things you wonder about, want to make, and need to understand.
                        </p>
                        <motion.div
                            className="mt-8 inline-flex"
                            animate={prefersReducedMotion ? undefined : { y: [0, -3, 0] }}
                            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <Button
                                type="button"
                                onClick={handleExplore}
                                className="group h-12 gap-2.5 rounded-full px-6 text-sm font-semibold shadow-[0_12px_30px_-14px_rgba(40,100,70,0.65)] transition-[transform,box-shadow] hover:scale-[1.02] hover:shadow-[0_16px_34px_-12px_rgba(40,100,70,0.7)]"
                            >
                                Explore Moose
                                <FiArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                            </Button>
                        </motion.div>
                        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-muted-foreground lg:justify-start">
                            <span>Answers with context</span>
                            <span aria-hidden="true" className="text-primary/70">✳</span>
                            <span>Sources you can explore</span>
                            <span aria-hidden="true" className="text-primary/70">✳</span>
                            <span>Made for curiosity</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={prefersReducedMotion ? false : { opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.65, delay: 0.12, ease: 'easeOut' }}
                        className="relative mx-auto w-full max-w-[34rem]"
                        role="img"
                        aria-label="Animated preview of a Moose conversation"
                    >
                        <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/85 p-3 shadow-[0_32px_90px_-42px_rgba(28,66,43,0.5)] backdrop-blur-2xl sm:p-5">
                            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-amber-500/[0.07]" />
                            <div className="relative flex items-center justify-between border-b border-border/60 px-2 pb-4">
                                <div className="flex items-center gap-2.5">
                                    <MooseLogo size="sm" />
                                    <span className="text-sm font-semibold">A conversation</span>
                                </div>
                                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">LIVE CURIOSITY</span>
                            </div>
                            <div className="relative space-y-4 px-2 py-5 sm:px-4 sm:py-7">
                                <motion.div
                                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.35 }}
                                    className="ml-auto max-w-[86%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground shadow-sm"
                                >
                                    What makes the northern lights glow?
                                </motion.div>
                                <motion.div
                                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.55, delay: 0.65 }}
                                    className="max-w-[94%] rounded-2xl rounded-bl-md border border-border/65 bg-background/90 px-4 py-4 shadow-sm"
                                >
                                    <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10"><FiZap className="h-3.5 w-3.5" /></span>
                                        Here’s the beautiful part
                                    </div>
                                    <p className="mt-3 text-sm leading-6 text-foreground/85">
                                        Charged particles from the Sun meet gases high in Earth’s atmosphere. Oxygen glows green; nitrogen adds shades of violet and blue.
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-2.5 py-1 text-[10px] text-muted-foreground"><FiGlobe className="h-3 w-3 text-primary" /> NASA Science</span>
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-2.5 py-1 text-[10px] text-muted-foreground"><FiBookOpen className="h-3 w-3 text-primary" /> NOAA</span>
                                    </div>
                                </motion.div>
                                <div aria-hidden="true" className="flex items-center gap-1.5 pl-1 pt-1">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/50 motion-reduce:animate-none" />
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/50 [animation-delay:150ms] motion-reduce:animate-none" />
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/50 [animation-delay:300ms] motion-reduce:animate-none" />
                                    <span className="ml-1 text-[10px] text-muted-foreground">Always a little more to discover</span>
                                </div>
                            </div>
                            <div className="relative rounded-2xl border border-border/60 bg-background/80 p-2 text-xs text-muted-foreground shadow-inner">
                                <div className="flex items-center gap-2 rounded-xl bg-card px-3.5 py-3">
                                    <span className="flex-1">Ask something wonderful…</span>
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground"><FiArrowUpRight className="h-4 w-4" /></span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                <section className="mx-auto mt-14 w-full max-w-4xl sm:mt-20">
                    <div className="mb-3 flex items-center justify-between px-1 text-left">
                        <div>
                            <p className="text-sm font-semibold tracking-[-0.01em] text-foreground">A few places to begin</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">Choose a thought, then make it your own.</p>
                        </div>
                        <span className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/60 sm:inline">Curiosity, curated</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 text-left sm:grid-cols-2">
                        {promptIdeas.map(({ icon: Icon, label, prompt }) => (
                            <button
                                key={label}
                                type="button"
                                onClick={() => handleStartChat(prompt)}
                                className="group flex min-h-[4.5rem] items-center gap-3.5 rounded-2xl border border-border/70 bg-card/65 p-3.5 text-left shadow-[0_8px_28px_-24px_rgba(20,35,27,0.42)] backdrop-blur-lg transition-[transform,border-color,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:shadow-[0_16px_34px_-24px_rgba(40,100,70,0.32)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                                    <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-xs font-medium text-muted-foreground">{label}</span>
                                    <span className="mt-0.5 block text-sm leading-5 text-foreground/90">{prompt}</span>
                                </span>
                                <FiArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground/55 transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                            </button>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
