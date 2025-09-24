import { PlotConfig } from '../components/FunctionPlot';

export interface Message {
  id: string;
  type: 'cell';
  content: string;
  output?: string;
  outputType?: 'text' | 'image' | 'canvas' | 'plot';
  canvasData?: unknown;
  plotData?: PlotConfig;
  isFormula: boolean;
  timestamp: Date;
  cellNumber: number;
}

export interface SheetData {
  messages: Message[];
}

export interface SheetInfo {
  id: string;
  name: string;
  createdAt: Date;
}

// Nuevos tipos para mejor tipado
export interface SheetOperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface StorageData {
  sheets: SheetInfo[];
  sheetData: Record<string, SheetData>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface MathEvaluationResult {
  success: boolean;
  result?: unknown;
  error?: string;
  executionTime?: number;
}

// Tipos para el estado de carga
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncOperation<T = unknown> {
  state: LoadingState;
  data?: T;
  error?: string;
}