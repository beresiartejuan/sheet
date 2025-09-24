import { useEffect, useState } from 'react';
import { UI_CONFIG } from '../config/constants';

interface LoadingDotsProps {
    text?: string;
    size?: 'sm' | 'md' | 'lg';
    color?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
    text = 'Cargando',
    size = 'md',
    color = 'text-blue-600'
}) => {
    const [dotCount, setDotCount] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setDotCount((prev) => (prev + 1) % (UI_CONFIG.LOADING_ANIMATION.DOT_COUNT + 1));
        }, UI_CONFIG.LOADING_ANIMATION.DELAY_BETWEEN_DOTS * 1000);

        return () => clearInterval(interval);
    }, []);

    const sizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    const dotSizes = {
        sm: 'w-1 h-1',
        md: 'w-2 h-2',
        lg: 'w-3 h-3',
    };

    return (
        <div className={`flex items-center gap-2 ${sizeClasses[size]} ${color}`}>
            <span>{text}</span>
            <div className="flex items-center gap-1">
                {[...Array(UI_CONFIG.LOADING_ANIMATION.DOT_COUNT)].map((_, index) => (
                    <div
                        key={index}
                        className={`
              ${dotSizes[size]} 
              bg-current 
              rounded-full 
              transition-opacity 
              duration-300
              ${index < dotCount ? 'opacity-100' : 'opacity-30'}
            `}
                        style={{
                            animationDelay: `${index * UI_CONFIG.LOADING_ANIMATION.DELAY_BETWEEN_DOTS}s`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    color = 'border-blue-600'
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-6 h-6 border-2',
        lg: 'w-8 h-8 border-3',
    };

    return (
        <div
            className={`
        ${sizeClasses[size]} 
        ${color} 
        border-solid 
        border-t-transparent 
        rounded-full 
        animate-spin
      `}
        />
    );
};

interface LoadingOverlayProps {
    isVisible: boolean;
    text?: string;
    type?: 'dots' | 'spinner';
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    isVisible,
    text = 'Procesando',
    type = 'dots'
}) => {
    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center gap-4">
                {type === 'dots' ? (
                    <LoadingDots text={text} size="lg" />
                ) : (
                    <>
                        <LoadingSpinner size="lg" />
                        <span className="text-lg text-gray-700">{text}</span>
                    </>
                )}
            </div>
        </div>
    );
};


