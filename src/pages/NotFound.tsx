import { FiArrowLeft, FiHome } from 'react-icons/fi';
import { MooseLogo } from '@/components/MooseLogo';
import { Button } from '@/components/ui/button';

export function NotFound() {
    return (
        <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-5 py-16">
            <div aria-hidden="true" className="welcome-glow pointer-events-none absolute inset-x-0 top-0 h-96" />
            <section className="relative mx-auto w-full max-w-xl text-center">
                <a href="#/welcome" className="mx-auto inline-flex rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <MooseLogo size="lg" showText />
                </a>
                <div className="mt-16 text-[clamp(6rem,24vw,10rem)] font-semibold leading-none tracking-[-0.09em] text-primary/15">404</div>
                <p className="-mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-primary">Trail ends here</p>
                <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">We couldn’t find that page.</h1>
                <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
                    This path doesn’t lead anywhere. Head back to your chats and we’ll find another way.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Button variant="outline" className="gap-2 rounded-xl" onClick={() => window.history.back()}>
                        <FiArrowLeft aria-hidden="true" className="h-4 w-4" />
                        Go back
                    </Button>
                    <Button className="gap-2 rounded-xl" onClick={() => { window.location.hash = '#/welcome'; }}>
                        <FiHome aria-hidden="true" className="h-4 w-4" />
                        Back to home
                    </Button>
                </div>
            </section>
        </main>
    );
}
