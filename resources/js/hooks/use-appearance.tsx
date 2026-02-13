import { useCallback, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = () => {
    const isDark = false;

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

export function initializeTheme() {
    localStorage.setItem('appearance', 'light');
    applyTheme();
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('light');

    const updateAppearance = useCallback((mode: Appearance) => {
        const forcedMode: Appearance = mode === 'light' ? mode : 'light';
        setAppearance(forcedMode);

        // Store in localStorage for client-side persistence...
        localStorage.setItem('appearance', forcedMode);

        // Store in cookie for SSR...
        setCookie('appearance', forcedMode);

        applyTheme();
    }, []);

    return { appearance, updateAppearance } as const;
}
