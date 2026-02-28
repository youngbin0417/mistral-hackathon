import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
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
    const [aiCache, setAiCache] = useState<Record<string, AiCacheEntry>>({});
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
                const errData = await response.json();
                throw new Error(errData.error || "AI Generation failed");
            }
            const data = await response.json();
            if (data.code) {
                const cleanCode = stripMarkdownFences(data.code);
                const newLibs: string[] = data.injectedLibraries || [];
                const newEntry: AiCacheEntry = { code: cleanCode, libs: newLibs };

                aiCacheRef.current = { ...aiCacheRef.current, [prompt]: newEntry };
                setAiCache(aiCacheRef.current);
                if (newLibs.length > 0) setInjectedLibs(prev => Array.from(new Set([...prev, ...newLibs])));

                const { processedCode } = applyCachedReplacements(fullRawCode, aiCacheRef.current);
                const allLibs = Array.from(new Set(Object.values(aiCacheRef.current).flatMap(e => e.libs)));
                setCode(allLibs.length > 0 ? prependImports(processedCode, allLibs) : processedCode);
            }
        } catch (err: any) {
            toast.error(err.message || "AI Magic failed! Please try again.");
            console.error("AI Generation failed:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCodeChange = (rawCode: string) => {
        let cacheChanged = false;
        const newCache = { ...aiCacheRef.current };
        Object.keys(newCache).forEach(prompt => {
            if (!rawCode.includes(`// AI: ${prompt}`)) {
                delete newCache[prompt];
                cacheChanged = true;
            }
        });

        if (cacheChanged) {
            aiCacheRef.current = newCache;
            setAiCache(newCache);
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
