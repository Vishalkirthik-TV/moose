import { useUser } from '@clerk/clerk-react';
import { FiCheck, FiExternalLink, FiMoon, FiSun, FiZap } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { WorkspaceLayout } from '@/components/WorkspaceLayout';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { useProviderModels } from '@/hooks/useProviderModels';
import { useChatStore } from '@/lib/store';
import type { ProviderId } from '@/lib/providers';

const googleAccountUrl = 'https://myaccount.google.com/';
const providerOptions: Array<{ id: ProviderId; name: string; description: string; keyName: string }> = [
    { id: 'zai', name: 'Z.AI', description: 'GLM models for everyday conversation and reasoning.', keyName: 'VITE_ZAI_API_KEY' },
    { id: 'openrouter', name: 'OpenRouter', description: 'Choose from models available through OpenRouter.', keyName: 'VITE_OPENROUTER_API_KEY' },
];

export function Settings() {
    const { user } = useUser();
    const { theme, toggleTheme } = useTheme();
    const { providerId, providers, models, isLoading, error } = useProviderModels();
    const setProviderId = useChatStore((state) => state.setProviderId);
    const displayName = user?.fullName || user?.username || 'Moose user';
    const email = user?.primaryEmailAddress?.emailAddress;
    const hasGoogleAccount = user?.externalAccounts.some((account) => account.provider === 'google') ?? false;

    return (
        <WorkspaceLayout scrollable>
            <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
                <p className="text-sm font-medium text-primary">Personalize your space</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Settings</h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">Manage your account, AI providers, and how Moose looks.</p>

                <section className="mt-8 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
                    <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <FiZap aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <div>
                            <h2 className="font-semibold">Manage providers</h2>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                Choose which configured provider Moose uses. API keys stay on the server and are never sent to your browser.
                            </p>
                        </div>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {providerOptions.map((provider) => {
                            const configured = providers?.[provider.id] ?? false;
                            const selected = providerId === provider.id;
                            return (
                                <button
                                    key={provider.id}
                                    type="button"
                                    aria-pressed={selected}
                                    disabled={!configured || isLoading}
                                    onClick={() => setProviderId(provider.id)}
                                    className={`rounded-2xl border p-4 text-left transition-[border-color,background-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-65 ${
                                        selected
                                            ? 'border-primary/50 bg-primary/5 shadow-sm'
                                            : 'border-border/70 bg-background hover:border-primary/30'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-medium">{provider.name}</span>
                                        {selected && <FiCheck aria-label="Selected" className="h-4 w-4 text-primary" />}
                                    </div>
                                    <p className="mt-1.5 text-sm leading-5 text-muted-foreground">{provider.description}</p>
                                    <p className="mt-3 text-xs font-medium text-muted-foreground">
                                        {isLoading
                                            ? 'Checking server configuration…'
                                            : error
                                                ? 'Could not verify provider configuration'
                                            : configured
                                                ? `Configured · ${provider.keyName}`
                                                : `Add ${provider.keyName} to the server environment`}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                    {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
                    {!isLoading && providers?.[providerId] && (
                        <p className="mt-3 text-xs text-muted-foreground" role="status">
                            {models.length > 0
                                ? `${models.length} ${models.length === 1 ? 'model' : 'models'} available for ${providerOptions.find((provider) => provider.id === providerId)?.name}.`
                                : 'No models are currently available.'}
                        </p>
                    )}
                    <p className="mt-4 rounded-xl bg-muted/60 px-3.5 py-3 text-xs leading-5 text-muted-foreground">
                        Configure <code className="font-medium text-foreground">VITE_ZAI_API_KEY</code>, <code className="font-medium text-foreground">VITE_OPENROUTER_API_KEY</code>, and <code className="font-medium text-foreground">VITE_SERPAPI_KEY</code> in the server-side <code className="font-medium text-foreground">.env</code> file, then restart the server.
                    </p>
                </section>

                <section className="mt-6 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        {user?.imageUrl ? (
                            <img src={user.imageUrl} alt="" className="h-14 w-14 rounded-full bg-muted object-cover" />
                        ) : (
                            <div aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                                {displayName.slice(0, 1).toUpperCase()}
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <h2 className="truncate font-semibold">{displayName}</h2>
                            {email && <p className="mt-1 truncate text-sm text-muted-foreground">{email}</p>}
                            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-foreground/80">
                                {hasGoogleAccount ? (
                                    <>
                                        <FcGoogle aria-hidden="true" className="h-3.5 w-3.5" />
                                        <span>Google account connected</span>
                                    </>
                                ) : (
                                    <span>Moose account</span>
                                )}
                            </div>
                        </div>
                        {hasGoogleAccount && (
                            <Button asChild variant="outline" className="gap-2 self-start rounded-xl sm:self-auto">
                                <a href={googleAccountUrl} target="_blank" rel="noopener noreferrer">
                                    <FiExternalLink aria-hidden="true" className="h-4 w-4" />
                                    Manage Google account
                                </a>
                            </Button>
                        )}
                    </div>
                </section>

                <section className="mt-6 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
                    <div>
                        <h2 className="font-semibold">Profile & security</h2>
                        {hasGoogleAccount ? (
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                Your profile and sign-in are connected to Google. To change your name, profile photo, password, or security settings, manage them directly in your Google Account.
                            </p>
                        ) : (
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                Your account details are managed by your sign-in provider. If you use Google to sign in, you can manage your profile and security settings in your Google Account.
                            </p>
                        )}
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <div className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm">
                                <FcGoogle aria-hidden="true" className="h-5 w-5" />
                                <span className="font-medium">Google</span>
                                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${hasGoogleAccount ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    {hasGoogleAccount ? 'Connected' : 'Not connected'}
                                </span>
                            </div>
                            {hasGoogleAccount && (
                                <Button asChild variant="ghost" className="gap-2 rounded-xl text-primary hover:text-primary">
                                    <a href={googleAccountUrl} target="_blank" rel="noopener noreferrer">
                                        Go to Google Account
                                        <FiExternalLink aria-hidden="true" className="h-4 w-4" />
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </section>

                <section className="mt-6 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-semibold">Appearance</h2>
                            <p className="mt-1 text-sm text-muted-foreground">Choose the look that feels right for you.</p>
                        </div>
                        <div className="flex gap-2" role="group" aria-label="Appearance">
                            <Button
                                variant={theme === 'light' ? 'default' : 'outline'}
                                aria-pressed={theme === 'light'}
                                className="gap-2 rounded-xl"
                                onClick={() => theme !== 'light' && toggleTheme()}
                            >
                                <FiSun aria-hidden="true" className="h-4 w-4" />
                                Light
                            </Button>
                            <Button
                                variant={theme === 'dark' ? 'default' : 'outline'}
                                aria-pressed={theme === 'dark'}
                                className="gap-2 rounded-xl"
                                onClick={() => theme !== 'dark' && toggleTheme()}
                            >
                                <FiMoon aria-hidden="true" className="h-4 w-4" />
                                Dark
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        </WorkspaceLayout>
    );
}
