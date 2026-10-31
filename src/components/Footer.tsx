import { MooseLogo } from './MooseLogo';

export function Footer() {
    return (
        <footer className="border-t border-border/60 bg-background/75 backdrop-blur-xl">
            <div className="container mx-auto flex min-h-11 flex-wrap items-center justify-center gap-x-4 gap-y-1 px-3 py-1.5 sm:px-4">
                <MooseLogo size="sm" showText />
                <span className="text-[11px] font-normal text-muted-foreground">
                    Powered by <span className="font-medium text-foreground">GLM 4.7 Flash</span>
                </span>
            </div>
        </footer>
    );
}
