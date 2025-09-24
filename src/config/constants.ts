/**
 * Configuración y constantes de la aplicación
 */

// Configuración de almacenamiento
export const STORAGE_CONFIG = {
    SHEET_LIST_KEY: 'math-sheets',
    SHEET_DATA_PREFIX: 'sheet-data-',
    getSheetDataKey: (sheetId: string) => `${STORAGE_CONFIG.SHEET_DATA_PREFIX}${sheetId}`,
} as const;

// Configuración de gráficas
export const PLOT_CONFIG = {
    DEFAULT_STEPS: 200,
    DEFAULT_X_RANGE: { min: -10, max: 10 },
    COLORS: [
        '#4F46E5', // Indigo
        '#EF4444', // Red
        '#F59E0B', // Amber
        '#10B981', // Emerald
        '#8B5CF6', // Violet
        '#F97316', // Orange
        '#6B7280', // Gray
        '#EC4899', // Pink
        '#22D3EE', // Cyan
        '#A3E635', // Lime
        '#F43F5E', // Rose
        '#6366F1', // Blue
        '#14B8A6', // Teal
        '#EAB308', // Yellow
        '#3B82F6', // Sky
        '#D946EF', // Fuchsia
        '#FACC15', // Gold
        '#84CC16', // Green
    ],
    CANVAS_SIZE: { width: 800, height: 600 },
    GRID_STEPS: { x: 10, y: 10 },
} as const;

// Configuración de UI
export const UI_CONFIG = {
    LOADING_ANIMATION: {
        DURATION: 1.5, // seconds
        DOT_COUNT: 3,
        DELAY_BETWEEN_DOTS: 0.2, // seconds
    },
    CELL_CONFIG: {
        MAX_OUTPUT_LENGTH: 1000,
        AUTO_SCROLL_DELAY: 100, // ms
    },
    DEBOUNCE_DELAYS: {
        INPUT: 300, // ms
        RESIZE: 100, // ms
    },
} as const;

// Configuración matemática
export const MATH_CONFIG = {
    EVALUATION_TIMEOUT: 5000, // ms
    MAX_ITERATIONS: 1000,
    FORMULA_PATTERNS: {
        ASSIGNMENT: /^[a-zA-Z_][a-zA-Z0-9_]*\s*=/,
        FUNCTION_ASSIGNMENT: /^[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\)\s*=/,
        PLOT_COMMAND: /^plot\s+\{[^}]+\}\s+from\s+[-+]?\d*\.?\d+\s+to\s+[-+]?\d*\.?\d+$/i,
    },
    SYMBOL_DETECTION: /[+\-*/^()√∫∑]/,
} as const;

// Mensajes de error
export const ERROR_MESSAGES = {
    MATH: {
        PARSE_ERROR: 'Error al analizar la expresión matemática',
        EVALUATION_ERROR: 'Error al evaluar la expresión',
        TIMEOUT_ERROR: 'La evaluación tomó demasiado tiempo',
        INVALID_FUNCTION: 'Función matemática no válida',
    },
    PLOT: {
        PARSE_ERROR: 'Error en el formato del comando plot',
        NO_FUNCTIONS: 'No se especificaron funciones para graficar',
        INVALID_RANGE: 'Rango inválido para los ejes',
        RENDER_ERROR: 'Error al generar la gráfica',
    },
    STORAGE: {
        SAVE_ERROR: 'Error al guardar los datos',
        LOAD_ERROR: 'Error al cargar los datos',
        PARSE_ERROR: 'Error al procesar los datos guardados',
    },
    GENERAL: {
        UNKNOWN_ERROR: 'Error desconocido',
        INVALID_INPUT: 'Entrada no válida',
    },
} as const;

// Configuración por defecto para nuevas hojas
export const DEFAULT_SHEET_CONFIG = {
    NAME_PREFIX: 'Hoja',
    INITIAL_CELL_COUNT: 0,
    AUTO_SAVE: true,
} as const;
