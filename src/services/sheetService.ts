import { SheetInfo, Message, SheetOperationResult, ValidationResult } from '../types';
import { PersistenceService } from './persistenceService';
import { processUserInput, ProcessorCallbacks } from './inputProcessor';
import { DEFAULT_SHEET_CONFIG, MATH_CONFIG, ERROR_MESSAGES } from '../config/constants';

/**
 * Servicio de lógica de negocio para las hojas de cálculo matemáticas
 */
export class SheetService {
    private static instance: SheetService;
    private persistenceService: PersistenceService;
    private listeners: Set<() => void> = new Set();

    private constructor() {
        this.persistenceService = PersistenceService.getInstance();
    }

    public static getInstance(): SheetService {
        if (!SheetService.instance) {
            SheetService.instance = new SheetService();
        }
        return SheetService.instance;
    }

    /**
     * Subscribe to changes
     */
    subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Notify all listeners of changes
     */
    private notify(): void {
        this.listeners.forEach(listener => listener());
    }

    /**
     * Validar entrada del usuario
     */
    private validateInput(input: string): ValidationResult {
        const errors: string[] = [];

        if (!input.trim()) {
            return { isValid: true, errors: [] }; // Input vacío es válido
        }

        // Verificar longitud máxima
        if (input.length > 1000) {
            errors.push('La entrada es demasiado larga');
        }

        // Verificar caracteres peligrosos básicos
        if (input.includes('eval') || input.includes('Function')) {
            errors.push('La entrada contiene código no permitido');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    /**
     * Obtiene todas las hojas
     */
    getSheets(): SheetOperationResult<SheetInfo[]> {
        return this.persistenceService.getSheets();
    }

    /**
     * Crea una nueva hoja
     */
    createSheet(customName?: string): SheetOperationResult<SheetInfo> {
        const sheetsResult = this.persistenceService.getSheets();
        if (!sheetsResult.success) {
            return { success: false, error: sheetsResult.error };
        }

        const existingSheets = sheetsResult.data || [];
        const name = customName || `${DEFAULT_SHEET_CONFIG.NAME_PREFIX} ${existingSheets.length + 1}`;

        const newSheet: SheetInfo = {
            id: Date.now().toString(),
            name,
            createdAt: new Date(),
        };

        const updatedSheets = [...existingSheets, newSheet];
        const saveResult = this.persistenceService.saveSheets(updatedSheets);

        if (!saveResult.success) {
            return { success: false, error: saveResult.error };
        }

        this.notify();
        return { success: true, data: newSheet };
    }

    /**
     * Elimina una hoja
     */
    deleteSheet(sheetId: string): SheetOperationResult {
        const sheetsResult = this.persistenceService.getSheets();
        if (!sheetsResult.success) {
            return { success: false, error: sheetsResult.error };
        }

        const existingSheets = sheetsResult.data || [];

        // No permitir eliminar la última hoja
        if (existingSheets.length <= 1) {
            return { success: false, error: 'No se puede eliminar la última hoja' };
        }

        const updatedSheets = existingSheets.filter(sheet => sheet.id !== sheetId);
        const saveResult = this.persistenceService.saveSheets(updatedSheets);

        if (!saveResult.success) {
            return { success: false, error: saveResult.error };
        }

        // Eliminar datos de la hoja
        const removeResult = this.persistenceService.removeSheetData(sheetId);
        if (!removeResult.success) {
            return { success: false, error: removeResult.error };
        }

        this.notify();
        return { success: true };
    }

    /**
     * Renombra una hoja
     */
    renameSheet(sheetId: string, newName: string): SheetOperationResult {
        if (!newName.trim()) {
            return { success: false, error: 'El nombre no puede estar vacío' };
        }

        const sheetsResult = this.persistenceService.getSheets();
        if (!sheetsResult.success) {
            return { success: false, error: sheetsResult.error };
        }

        const existingSheets = sheetsResult.data || [];
        const updatedSheets = existingSheets.map(sheet =>
            sheet.id === sheetId ? { ...sheet, name: newName.trim() } : sheet
        );

        const saveResult = this.persistenceService.saveSheets(updatedSheets);
        if (!saveResult.success) {
            return { success: false, error: saveResult.error };
        }

        this.notify();
        return { success: true };
    }

    /**
     * Obtiene los mensajes de una hoja
     */
    getSheetMessages(sheetId: string): SheetOperationResult<Message[]> {
        const dataResult = this.persistenceService.getSheetData(sheetId);
        if (!dataResult.success) {
            return { success: false, error: dataResult.error };
        }

        return { success: true, data: dataResult.data?.messages || [] };
    }

    /**
     * Añade un nuevo mensaje a una hoja
     */
    addMessage(sheetId: string, content: string): SheetOperationResult<Message> {
        // Validar entrada
        const validation = this.validateInput(content);
        if (!validation.isValid) {
            return { success: false, error: validation.errors.join(', ') };
        }

        const messagesResult = this.getSheetMessages(sheetId);
        if (!messagesResult.success) {
            return { success: false, error: messagesResult.error };
        }

        const messages = messagesResult.data || [];
        const cellNumber = messages.length + 1;
        const isFormula = content.includes('=') || MATH_CONFIG.SYMBOL_DETECTION.test(content);

        // Crear mensaje base
        const newMessage: Message = {
            id: Date.now().toString(),
            type: 'cell',
            content: content.trim(),
            output: '',
            outputType: 'text',
            isFormula,
            timestamp: new Date(),
            cellNumber,
        };

        // Procesar la entrada
        const callbacks: ProcessorCallbacks = {
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
            },
        };

        try {
            processUserInput({
                input: content,
                sheetId,
                cellNumber,
                callbacks,
            });
        } catch (error) {
            return {
                success: false,
                error: `${ERROR_MESSAGES.MATH.EVALUATION_ERROR}: ${error instanceof Error ? error.message : ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR}`,
            };
        }

        const updatedMessages = [...messages, newMessage];
        const saveResult = this.persistenceService.saveSheetData(sheetId, { messages: updatedMessages });

        if (!saveResult.success) {
            return { success: false, error: saveResult.error };
        }

        this.notify();
        return { success: true, data: newMessage };
    }

    /**
     * Re-evalúa un mensaje existente
     */
    reEvaluateMessage(sheetId: string, messageId: string): SheetOperationResult {
        const messagesResult = this.getSheetMessages(sheetId);
        if (!messagesResult.success) {
            return { success: false, error: messagesResult.error };
        }

        const messages = messagesResult.data || [];
        const messageIndex = messages.findIndex(msg => msg.id === messageId);

        if (messageIndex === -1) {
            return { success: false, error: 'Mensaje no encontrado' };
        }

        const message = messages[messageIndex];

        // Crear callbacks para actualizar el mensaje
        const callbacks: ProcessorCallbacks = {
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
            },
        };

        try {
            processUserInput({
                input: message.content,
                sheetId,
                cellNumber: message.cellNumber,
                callbacks,
            });
        } catch (error) {
            return {
                success: false,
                error: `${ERROR_MESSAGES.MATH.EVALUATION_ERROR}: ${error instanceof Error ? error.message : ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR}`,
            };
        }

        // Actualizar el mensaje en su posición original
        messages[messageIndex] = message;
        const saveResult = this.persistenceService.saveSheetData(sheetId, { messages });

        if (!saveResult.success) {
            return { success: false, error: saveResult.error };
        }

        this.notify();
        return { success: true };
    }

    /**
     * Actualiza el contenido de un mensaje
     */
    updateMessage(sheetId: string, messageId: string, newContent: string): SheetOperationResult {
        const validation = this.validateInput(newContent);
        if (!validation.isValid) {
            return { success: false, error: validation.errors.join(', ') };
        }

        const messagesResult = this.getSheetMessages(sheetId);
        if (!messagesResult.success) {
            return { success: false, error: messagesResult.error };
        }

        const messages = messagesResult.data || [];
        const updatedMessages = messages.map(msg =>
            msg.id === messageId
                ? {
                    ...msg,
                    content: newContent,
                    isFormula: newContent.includes('=') || MATH_CONFIG.SYMBOL_DETECTION.test(newContent),
                }
                : msg
        );

        const saveResult = this.persistenceService.saveSheetData(sheetId, { messages: updatedMessages });
        if (!saveResult.success) {
            return { success: false, error: saveResult.error };
        }

        this.notify();
        return { success: true };
    }

    /**
     * Inicializa el servicio con una hoja por defecto si no existe ninguna
     */
    initialize(): SheetOperationResult {
        const sheetsResult = this.getSheets();
        if (!sheetsResult.success) {
            return { success: false, error: sheetsResult.error };
        }

        const sheets = sheetsResult.data || [];
        if (sheets.length === 0) {
            const createResult = this.createSheet();
            return { success: createResult.success, error: createResult.error };
        }

        return { success: true };
    }
}
