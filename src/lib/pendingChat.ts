import type { ChatInputOptions } from '@/components/ChatInput';

let pendingChatOptions: ChatInputOptions | null = null;

export function setPendingChatOptions(options: ChatInputOptions) {
    pendingChatOptions = options;
}

export function consumePendingChatOptions() {
    const options = pendingChatOptions;
    pendingChatOptions = null;
    return options;
}
