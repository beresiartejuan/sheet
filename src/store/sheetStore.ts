import { SheetInfo, SheetData, Message } from '../types';
import { processUserInput } from '../services/inputProcessor';

class SheetStore {
  private listeners: Set<() => void> = new Set();

  // Subscribe to store changes
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners of changes
  private notify() {
    this.listeners.forEach(listener => listener());
  }

  // Sheet management
  getSheets(): SheetInfo[] {
    const savedSheets = sessionStorage.getItem('math-sheets');
    if (savedSheets) {
      return JSON.parse(savedSheets).map((sheet: { createdAt: string }) => ({
        ...sheet,
        createdAt: new Date(sheet.createdAt)
      }));
    }
    return [];
  }

  saveSheets(sheets: SheetInfo[]) {
    sessionStorage.setItem('math-sheets', JSON.stringify(sheets));
    this.notify();
  }

  createSheet(): SheetInfo {
    const sheets = this.getSheets();
    const newSheet: SheetInfo = {
      id: Date.now().toString(),
      name: `Hoja ${sheets.length + 1}`,
      createdAt: new Date()
    };

    const updatedSheets = [...sheets, newSheet];
    this.saveSheets(updatedSheets);
    return newSheet;
  }

  deleteSheet(sheetId: string) {
    const sheets = this.getSheets();
    if (sheets.length <= 1) return false; // Don't delete the last sheet

    const updatedSheets = sheets.filter(sheet => sheet.id !== sheetId);
    this.saveSheets(updatedSheets);

    // Remove sheet data from sessionStorage
    sessionStorage.removeItem(`sheet-data-${sheetId}`);
    return true;
  }

  renameSheet(sheetId: string, newName: string) {
    const sheets = this.getSheets();
    const updatedSheets = sheets.map(sheet =>
      sheet.id === sheetId ? { ...sheet, name: newName } : sheet
    );
    this.saveSheets(updatedSheets);
  }

  // Message management
  getSheetMessages(sheetId: string): Message[] {
    const savedData = sessionStorage.getItem(`sheet-data-${sheetId}`);
    if (savedData) {
      const sheetData: SheetData = JSON.parse(savedData);
      return sheetData.messages.map((msg, index) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        cellNumber: msg.cellNumber || index + 1
      }));
    }
    return [];
  }

  saveSheetMessages(sheetId: string, messages: Message[]) {
    const sheetData: SheetData = { messages };
    sessionStorage.setItem(`sheet-data-${sheetId}`, JSON.stringify(sheetData));
    this.notify();
  }

  addMessage(sheetId: string, content: string): Message {
    const messages = this.getSheetMessages(sheetId);
    const cellNumber = messages.length + 1;
    const isFormula = content.includes('=') || /[+\-*/^()√∫∑]/.test(content);

    // Crear mensaje base
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'cell',
      content: content.trim(),
      output: '',
      outputType: 'text', // Se cambiará según el callback usado
      isFormula,
      timestamp: new Date(),
      cellNumber
    };

    // Procesar la entrada usando el servicio separado
    processUserInput({
      input: content,
      sheetId,
      cellNumber,
      callbacks: {
        text: (result: string) => {
          newMessage.output = result;
          newMessage.outputType = 'text';
        },
        image: (imageUrl: string) => {
          newMessage.output = imageUrl;
          newMessage.outputType = 'image';
        },
        plot: (plotConfig) => {
          newMessage.plotData = plotConfig;
          newMessage.outputType = 'plot';
          // NO establecer output de texto, solo la data de la gráfica
        }
      }
    });

    const updatedMessages = [...messages, newMessage];
    this.saveSheetMessages(sheetId, updatedMessages);
    return newMessage;
  }

  reEvaluateMessage(sheetId: string, messageId: string) {
    const messages = this.getSheetMessages(sheetId);
    const messageIndex = messages.findIndex(msg => msg.id === messageId);

    if (messageIndex === -1) return;

    const message = messages[messageIndex];

    // Re-procesar la entrada
    processUserInput({
      input: message.content,
      sheetId,
      cellNumber: message.cellNumber,
      callbacks: {
        text: (result: string) => {
          message.output = result;
          message.outputType = 'text';
        },
        image: (imageUrl: string) => {
          message.output = imageUrl;
          message.outputType = 'image';
        },
        plot: (plotConfig) => {
          message.plotData = plotConfig;
          message.outputType = 'plot';
          // NO establecer output de texto, solo la data de la gráfica
        }
      }
    });

    // Actualizar el mensaje en su posición original
    messages[messageIndex] = message;
    this.saveSheetMessages(sheetId, messages);
  }
  updateMessage(sheetId: string, messageId: string, newContent: string) {
    const messages = this.getSheetMessages(sheetId);
    const updatedMessages = messages.map(msg =>
      msg.id === messageId
        ? {
          ...msg,
          content: newContent,
          isFormula: newContent.includes('=') || /[+\-*/^()√∫∑]/.test(newContent)
        }
        : msg
    );
    this.saveSheetMessages(sheetId, updatedMessages);
  }

  // Initialize store with first sheet if empty
  initialize() {
    const sheets = this.getSheets();
    if (sheets.length === 0) {
      this.createSheet();
    }
  }
}

export const sheetStore = new SheetStore();