import { SignIn, SignUp } from '@clerk/clerk-react';
import { useState } from 'react';
import { MooseLogo } from '@/components/MooseLogo';

export function Auth() {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');

    // Listen for hash changes to switch between signin/signup
    if (window.location.hash === '#/signup' && mode !== 'signup') {
        setMode('signup');
    } else if (window.location.hash === '#/signin' && mode !== 'signin') {
        setMode('signin');
    }

    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-4">
            <div aria-hidden="true" className="welcome-glow pointer-events-none absolute inset-x-0 top-0 h-96" />
            <MooseLogo size="lg" showText className="relative z-10 mb-6" />

            {mode === 'signin' ? (
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: 'mx-auto w-full max-w-md',
                            card: 'shadow-xl border border-border/50 bg-card rounded-2xl',
                            logoBox: 'hidden',
                            headerTitle: 'text-foreground',
                            headerSubtitle: 'text-muted-foreground',
                            formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
                        },
                    }}
                    routing="hash"
                    signUpUrl="#/signup"
                />
            ) : (
                <SignUp
                    appearance={{
                        elements: {
                            rootBox: 'mx-auto w-full max-w-md',
                            card: 'shadow-xl border border-border/50 bg-card rounded-2xl',
                            logoBox: 'hidden',
                            headerTitle: 'text-foreground',
                            headerSubtitle: 'text-muted-foreground',
                            formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
                        },
                    }}
                    routing="hash"
                    signInUrl="#/signin"
                />
            )}
        </div>
    );
}
