import { MooseLogo } from './MooseLogo';
import { useChatStore } from '@/lib/store';

export function Footer() {
    const providerId = useChatStore((state) => state.providerId);
    const modelId = useChatStore((state) => state.modelId);
    const providerName = providerId === 'openrouter' ? 'OpenRouter' : 'Z.AI';
    const modelName = modelId === 'glm-4.7-flash' ? 'GLM 4.7 Flash' : modelId || 'No model selected';

    return (
        <footer className="border-t border-border/60 bg-background/75 backdrop-blur-xl">
            <div className="container mx-auto flex min-h-11 flex-wrap items-center justify-center gap-x-4 gap-y-1 px-3 py-1.5 sm:px-4">
                <MooseLogo size="sm" showText />
                <span className="text-[11px] font-normal text-muted-foreground">
                    Powered by <span className="font-medium text-foreground">{providerName} · {modelName}</span>
                </span>
            </div>
        </footer>
    );
}
