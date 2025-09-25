import { useState, useCallback } from 'react';

// Hook para manejar estados de carga
export const useLoading = (initialState = false) => {
    const [isLoading, setIsLoading] = useState(initialState);
    const [error, setError] = useState<string | null>(null);

    const startLoading = useCallback(() => {
        setIsLoading(true);
        setError(null);
    }, []);

    const stopLoading = useCallback(() => {
        setIsLoading(false);
    }, []);

    const setLoadingError = useCallback((errorMessage: string) => {
        setIsLoading(false);
        setError(errorMessage);
    }, []);

    return {
        isLoading,
        error,
        startLoading,
        stopLoading,
        setLoadingError,
    };
};
