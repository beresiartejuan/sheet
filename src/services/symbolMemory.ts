/**
 * Servicio para manejar la memoria de símbolos y funciones de manera amigable para el usuario
 * Mantiene tanto la versión original (para mostrar) como la compilada (para cálculos)
 */

export interface StoredSymbol {
    name: string;
    originalExpression: string;
    type: 'function' | 'variable';
    timestamp: Date;
}

export interface StoredFunction extends StoredSymbol {
    type: 'function';
    parameters: string[];
}

export interface StoredVariable extends StoredSymbol {
    type: 'variable';
    value: unknown;
}

class SymbolMemory {
    private sheetSymbols = new Map<string, Map<string, StoredSymbol>>();

    /**
     * Obtiene la memoria de símbolos para una hoja específica
     */
    private getSheetMemory(sheetId: string): Map<string, StoredSymbol> {
        if (!this.sheetSymbols.has(sheetId)) {
            this.sheetSymbols.set(sheetId, new Map());
        }
        return this.sheetSymbols.get(sheetId)!;
    }

    /**
     * Almacena una función con su expresión original
     */
    storeFunction(sheetId: string, name: string, originalExpression: string, parameters: string[]): void {
        const memory = this.getSheetMemory(sheetId);
        const storedFunction: StoredFunction = {
            name,
            originalExpression,
            type: 'function',
            parameters,
            timestamp: new Date()
        };
        memory.set(name, storedFunction);
    }

    /**
     * Almacena una variable con su valor original
     */
    storeVariable(sheetId: string, name: string, originalExpression: string, value: unknown): void {
        const memory = this.getSheetMemory(sheetId);
        const storedVariable: StoredVariable = {
            name,
            originalExpression,
            type: 'variable',
            value,
            timestamp: new Date()
        };
        memory.set(name, storedVariable);
    }

    /**
     * Obtiene un símbolo almacenado
     */
    getSymbol(sheetId: string, name: string): StoredSymbol | undefined {
        const memory = this.getSheetMemory(sheetId);
        return memory.get(name);
    }

    /**
     * Obtiene todos los símbolos de una hoja
     */
    getAllSymbols(sheetId: string): StoredSymbol[] {
        const memory = this.getSheetMemory(sheetId);
        return Array.from(memory.values()).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }

    /**
     * Obtiene todas las funciones de una hoja
     */
    getFunctions(sheetId: string): StoredFunction[] {
        return this.getAllSymbols(sheetId).filter((symbol): symbol is StoredFunction =>
            symbol.type === 'function'
        );
    }

    /**
     * Obtiene todas las variables de una hoja
     */
    getVariables(sheetId: string): StoredVariable[] {
        return this.getAllSymbols(sheetId).filter((symbol): symbol is StoredVariable =>
            symbol.type === 'variable'
        );
    }

    /**
     * Elimina un símbolo
     */
    deleteSymbol(sheetId: string, name: string): boolean {
        const memory = this.getSheetMemory(sheetId);
        return memory.delete(name);
    }

    /**
     * Limpia todos los símbolos de una hoja
     */
    clearSheet(sheetId: string): void {
        this.sheetSymbols.delete(sheetId);
    }

    /**
     * Verifica si existe un símbolo
     */
    hasSymbol(sheetId: string, name: string): boolean {
        const memory = this.getSheetMemory(sheetId);
        return memory.has(name);
    }
}

export const symbolMemory = new SymbolMemory();
