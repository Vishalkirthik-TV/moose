import { FiArrowUpRight, FiCpu, FiGlobe } from 'react-icons/fi';
import { WorkspaceLayout } from '@/components/WorkspaceLayout';

const modelNews = [
    { name: 'OpenAI', models: 'GPT models', detail: 'Product releases, research, and company announcements.', href: 'https://openai.com/news/' },
    { name: 'Anthropic', models: 'Claude models', detail: 'Claude releases, research notes, and safety updates.', href: 'https://www.anthropic.com/news' },
    { name: 'Google DeepMind', models: 'Gemini models', detail: 'Gemini and DeepMind research announcements.', href: 'https://deepmind.google/discover/blog/' },
    { name: 'DeepSeek', models: 'DeepSeek models', detail: 'Model releases and technical research from DeepSeek.', href: 'https://github.com/deepseek-ai' },
    { name: 'Z.AI', models: 'GLM models', detail: 'GLM model updates and announcements from Z.AI.', href: 'https://z.ai/' },
    { name: 'Meta AI', models: 'Llama models', detail: 'Open model releases and AI research from Meta.', href: 'https://ai.meta.com/blog/' },
];

export function Discover() {
    return (
        <WorkspaceLayout scrollable>
                <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
                    <p className="text-sm font-medium text-primary">The model landscape</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Discover AI</h1>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                        Follow model releases, research, and product news directly from the teams building them.
                    </p>

                    <div className="mt-8 flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
                        <FiGlobe aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <p>These links open each provider’s official newsroom or research feed, where you can read their latest announcements.</p>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {modelNews.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <FiCpu aria-hidden="true" className="h-5 w-5" />
                                    </div>
                                    <FiArrowUpRight aria-hidden="true" className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                                </div>
                                <p className="mt-5 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">{item.models}</p>
                                <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em]">{item.name}</h2>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                                <span className="mt-5 inline-block text-sm font-medium text-primary">Visit official updates</span>
                            </a>
                        ))}
                    </div>
                </div>
        </WorkspaceLayout>
    );
}
