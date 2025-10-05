import { CustomCommand } from '../customCommandSystem';
import { clearSheetMemory } from '../inputProcessor';

/**
 * Comando Clear - Limpia memoria
 */
export const clearCommand: CustomCommand = {
    name: 'clear',
    aliases: ['cls', 'reset'],
    description: 'Limpia toda la memoria de símbolos de la hoja',
    usage: 'clear',

    matcher: (input: string) => {
        const lower = input.toLowerCase();
        return lower === 'clear' || lower === 'cls' || lower === 'reset';
    },

    parser: () => [],

    executor: (context, callbacks) => {
        clearSheetMemory(context.sheetId);
        callbacks.text('✅ Memoria limpiada. Todas las funciones y variables han sido eliminadas.');
    }
};
