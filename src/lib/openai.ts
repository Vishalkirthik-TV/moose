export interface Source {
    title: string;
    link: string;
    source: string;
    position: number;
    favicon?: string;
}

export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
    sources?: Source[];
    sentAt?: number;
    attachments?: string[];
    isWebSearch?: boolean;
}
