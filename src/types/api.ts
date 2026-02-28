export interface ApiErrorResponse {
    error: string;
    details?: any;
}

export interface GenerateRequest {
    prompt: string;
    context?: {
        fullCode?: string;
    };
}

export interface GenerateResponse {
    code: string;
    injectedLibraries: string[];
}

export interface HealRequest {
    error: string;
    code: string;
    prompt?: string;
}

export interface HealResponse {
    fixedCode: string;
    explanation: string;
}

export interface RecentMagicItem {
    prompt: string;
    code: string;
    timestamp: number;
}

export interface RecentResponse {
    recent: RecentMagicItem[];
}

export interface ConfigGetResponse {
    hasApiKey: boolean;
}

export interface ConfigPostRequest {
    apiKey: string;
}

export interface ConfigPostResponse {
    success?: boolean;
    error?: string;
}
