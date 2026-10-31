import { UserProfile, useUser } from '@clerk/clerk-react';
import { FiMoon, FiSun, FiUser } from 'react-icons/fi';
import { WorkspaceLayout } from '@/components/WorkspaceLayout';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';

export function Settings() {
    const { user } = useUser();
    const { theme, toggleTheme } = useTheme();
    const displayName = user?.fullName || user?.username || 'Moose user';
    const email = user?.primaryEmailAddress?.emailAddress;

    return (
        <WorkspaceLayout>
            <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <main className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
                    <p className="text-sm font-medium text-primary">Personalize your space</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Settings</h1>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">Manage your profile and how Moose looks.</p>

                    <section className="mt-8 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
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
                            </div>
                            <Button variant="outline" className="gap-2 self-start rounded-xl sm:self-auto" onClick={() => document.getElementById('profile-details')?.scrollIntoView({ behavior: 'smooth' })}>
                                <FiUser aria-hidden="true" className="h-4 w-4" />
                                Edit profile
                            </Button>
                        </div>
                    </section>

                    <section className="mt-8 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
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

                    <section id="profile-details" className="mt-10 scroll-mt-8">
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold tracking-[-0.03em]">Profile & security</h2>
                            <p className="mt-1 text-sm text-muted-foreground">Update your personal details, sign-in methods, and account security.</p>
                        </div>
                        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
                            <UserProfile
                                routing="virtual"
                                appearance={{
                                    elements: {
                                        rootBox: 'w-full',
                                        cardBox: 'w-full shadow-none',
                                        card: 'w-full rounded-none border-0 shadow-none',
                                    },
                                }}
                            />
                        </div>
                    </section>
                </main>
            </div>
        </WorkspaceLayout>
    );
}
