import { MooseLogo } from './MooseLogo';

export function Footer() {
    return (
        <footer className="border-t border-border bg-background/80 backdrop-blur-sm">
            <div className="container mx-auto flex min-h-12 flex-wrap items-center justify-center gap-x-4 gap-y-1 px-3 py-2 sm:min-h-14 sm:px-4">
                <MooseLogo size="sm" showText />
                <span className="text-xs font-normal text-muted-foreground sm:text-sm">
                    Powered by <span className="font-medium text-foreground">GLM 4.7 Flash</span>
                </span>
            </div>
        </footer>
    );
}
