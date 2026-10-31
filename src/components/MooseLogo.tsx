import { cn } from '@/lib/utils';

interface MooseLogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    showText?: boolean;
}

export function MooseLogo({ size = 'md', className, showText = false }: MooseLogoProps) {
    const sizeClasses = {
        sm: 'h-5 w-5',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-10 w-10',
    };

    const textSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
    };

    return (
        <div
            className={cn('flex items-center gap-2', className)}
            role={showText ? undefined : 'img'}
            aria-label={showText ? undefined : 'Moose'}
        >
            <img className={sizeClasses[size]} src="/moose.svg" alt="" />
            {showText && (
                <span className={cn('font-medium tracking-tight', textSizes[size])}>
                    Moose
                </span>
            )}
        </div>
    );
}
