import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { MAX_AI_CACHE_SIZE } from '@/config/constants';
import { ApiErrorResponse, GenerateResponse } from '@/types/api';
import {
    applyCachedReplacements,
    prependImports,
    stripMarkdownFences,
    type AiCacheEntry,
} from '@/lib/codeTransform';

export function useAiGeneration(initialCode: string) {
    const [code, setCode] = useState(initialCode);
    const codeRef = useRef(code);
    useEffect(() => { codeRef.current = code; }, [code]);

    const [injectedLibs, setInjectedLibs] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const aiCacheRef = useRef<Record<string, AiCacheEntry>>({});

    const triggerAiGeneration = async (prompt: string, fullRawCode: string) => {
        setIsGenerating(true);
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, context: { fullCode: fullRawCode } })
            });

            if (!response.ok) {
                const errData = (await response.json()) as ApiErrorResponse;
                throw new Error(errData.error || "AI Generation failed");
            }
            const data = (await response.json()) as GenerateResponse;
            if (data.code) {
                const cleanCode = stripMarkdownFences(data.code);
                const newLibs: string[] = data.injectedLibraries || [];
                const newEntry: AiCacheEntry = { code: cleanCode, libs: newLibs };

                const updatedCache = { ...aiCacheRef.current, [prompt]: newEntry };

                // Evict oldest entries if we exceed MAX_AI_CACHE_SIZE
                const keys = Object.keys(updatedCache);
                if (keys.length > MAX_AI_CACHE_SIZE) {
                    const keysToRemove = keys.length - MAX_AI_CACHE_SIZE;
                    for (let i = 0; i < keysToRemove; i++) {
                        delete updatedCache[keys[i]];
                    }
                }

                aiCacheRef.current = updatedCache;
                if (newLibs.length > 0) setInjectedLibs(prev => Array.from(new Set([...prev, ...newLibs])));

                const { processedCode } = applyCachedReplacements(fullRawCode, aiCacheRef.current);
                const allLibs = Array.from(new Set(Object.values(aiCacheRef.current).flatMap(e => e.libs)));
                setCode(allLibs.length > 0 ? prependImports(processedCode, allLibs) : processedCode);
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "AI Magic failed! Please try again.";
            toast.error(errorMessage);
            console.error("AI Generation failed:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCodeChange = (rawCode: string) => {
        let cacheChanged = false;
        const newCache = { ...aiCacheRef.current };
        Object.keys(newCache).forEach(prompt => {
            const escapedPrompt = prompt.replace(/"/g, '\\"'); // Escape double quotes for inclusion in string literal
            // Check for the AI marker comment in the raw code
            if (!rawCode.includes(`/* ✨ AI Request: "${escapedPrompt}" */`)) {
                delete newCache[prompt];
                cacheChanged = true;
            }
        });

        if (cacheChanged) {
            aiCacheRef.current = newCache;
        }

        const { processedCode, uncachedPrompts } = applyCachedReplacements(rawCode, aiCacheRef.current);
        const allLibs = Array.from(new Set(Object.values(aiCacheRef.current).flatMap(e => e.libs)));
        const finalCode = allLibs.length > 0 ? prependImports(processedCode, allLibs) : processedCode;

        setCode(finalCode);
        if (uncachedPrompts.length > 0 && !isGenerating) {
            triggerAiGeneration(uncachedPrompts[0], rawCode);
        }
    };

    return {
        code,
        setCode,
        codeRef,
        injectedLibs,
        isGenerating,
        handleCodeChange
    };
}
