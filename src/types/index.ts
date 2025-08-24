export interface Message {
  id: string;
  type: 'cell';
  content: string;
  output?: string;
  outputType?: 'text' | 'image' | 'canvas';
  canvasData?: any;
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