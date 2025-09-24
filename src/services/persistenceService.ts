import { SheetInfo, SheetData, SheetOperationResult } from '../types';
import { STORAGE_CONFIG, ERROR_MESSAGES } from '../config/constants';

/**
 * Servicio de persistencia para el manejo de datos en sessionStorage
 */
export class PersistenceService {
    private static instance: PersistenceService;

    public static getInstance(): PersistenceService {
        if (!PersistenceService.instance) {
            PersistenceService.instance = new PersistenceService();
        }
        return PersistenceService.instance;
    }

    /**
     * Obtiene la lista de hojas guardadas
     */
    getSheets(): SheetOperationResult<SheetInfo[]> {
        try {
            const savedSheets = sessionStorage.getItem(STORAGE_CONFIG.SHEET_LIST_KEY);
            if (!savedSheets) {
                return { success: true, data: [] };
            }

            const parsedSheets = JSON.parse(savedSheets) as Array<{
                id: string;
                name: string;
                createdAt: string;
            }>;

            const sheets: SheetInfo[] = parsedSheets.map(sheet => ({
                ...sheet,
                createdAt: new Date(sheet.createdAt),
            }));

            return { success: true, data: sheets };
        } catch (error) {
            return {
                success: false,
                error: `${ERROR_MESSAGES.STORAGE.LOAD_ERROR}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    }

    /**
     * Guarda la lista de hojas
     */
    saveSheets(sheets: SheetInfo[]): SheetOperationResult {
        try {
            sessionStorage.setItem(STORAGE_CONFIG.SHEET_LIST_KEY, JSON.stringify(sheets));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: `${ERROR_MESSAGES.STORAGE.SAVE_ERROR}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    }

    /**
     * Obtiene los datos de una hoja específica
     */
    getSheetData(sheetId: string): SheetOperationResult<SheetData> {
        try {
            const key = STORAGE_CONFIG.getSheetDataKey(sheetId);
            const savedData = sessionStorage.getItem(key);

            if (!savedData) {
                return { success: true, data: { messages: [] } };
            }

            const sheetData = JSON.parse(savedData) as SheetData;

            // Convertir timestamps a Date objects
            const messagesWithDates = sheetData.messages.map((msg, index) => ({
                ...msg,
                timestamp: new Date(msg.timestamp),
                cellNumber: msg.cellNumber || index + 1,
            }));

            return {
                success: true,
                data: { messages: messagesWithDates },
            };
        } catch (error) {
            return {
                success: false,
                error: `${ERROR_MESSAGES.STORAGE.LOAD_ERROR}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    }

    /**
     * Guarda los datos de una hoja específica
     */
    saveSheetData(sheetId: string, data: SheetData): SheetOperationResult {
        try {
            const key = STORAGE_CONFIG.getSheetDataKey(sheetId);
            sessionStorage.setItem(key, JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: `${ERROR_MESSAGES.STORAGE.SAVE_ERROR}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    }

    /**
     * Elimina los datos de una hoja específica
     */
    removeSheetData(sheetId: string): SheetOperationResult {
        try {
            const key = STORAGE_CONFIG.getSheetDataKey(sheetId);
            sessionStorage.removeItem(key);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: `${ERROR_MESSAGES.STORAGE.SAVE_ERROR}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    }

    /**
     * Limpia todos los datos almacenados
     */
    clearAll(): SheetOperationResult {
        try {
            const keys = Object.keys(sessionStorage);
            const sheetKeys = keys.filter(key =>
                key === STORAGE_CONFIG.SHEET_LIST_KEY ||
                key.startsWith(STORAGE_CONFIG.SHEET_DATA_PREFIX)
            );

            sheetKeys.forEach(key => sessionStorage.removeItem(key));

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: `${ERROR_MESSAGES.STORAGE.SAVE_ERROR}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    }
}
