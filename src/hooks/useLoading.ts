import { useState } from 'react';

// Hook para manejar estados de carga
export const useLoading = (initialState = false) => {
    const [isLoading, setIsLoading] = useState(initialState);
    const [error, setError] = useState<string | null>(null);

    const startLoading = () => {
        setIsLoading(true);
        setError(null);
    };

    const stopLoading = () => {
        setIsLoading(false);
    };

    const setLoadingError = (errorMessage: string) => {
        setIsLoading(false);
        setError(errorMessage);
    };

    return {
        isLoading,
        error,
        startLoading,
        stopLoading,
        setLoadingError,
    };
};
