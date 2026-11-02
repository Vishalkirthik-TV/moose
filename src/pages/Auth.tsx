import { SignIn, SignUp } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';
import { MooseLogo } from '@/components/MooseLogo';

export function Auth() {
    const location = useLocation();
    const mode = location.pathname === '/signup' ? 'signup' : 'signin';

    // Signed-out users landing anywhere except the auth routes go to sign in
    if (location.pathname !== '/signin' && location.pathname !== '/signup') {
        return <Navigate to="/signin" replace />;
    }

    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-4">
            <div aria-hidden="true" className="welcome-glow pointer-events-none absolute inset-x-0 top-0 h-96" />
            <MooseLogo size="lg" showText className="relative z-10 mb-6" />

            {mode === 'signin' ? (
                <SignIn
                    routing="path"
                    path="/signin"
                    signUpUrl="/signup"
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
                />
            ) : (
                <SignUp
                    routing="path"
                    path="/signup"
                    signInUrl="/signin"
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
                />
            )}
        </div>
    );
}
