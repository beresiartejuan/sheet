import { commandRegistry, CustomCommand } from '../customCommandSystem';

/**
 * Comando Help - Sistema de ayuda
 */
export const helpCommand: CustomCommand = {
    name: 'help',
    aliases: ['?'],
    description: 'Muestra ayuda sobre comandos y símbolos',
    usage: 'help [comando] | ? [comando]',

    matcher: (input: string) => {
        const lower = input.toLowerCase();
        return lower === 'help' || lower === '?' || lower.startsWith('help ');
    },

    parser: (input: string) => {
        const parts = input.trim().split(/\s+/);
        return parts.length > 1 ? [parts[1]] : [];
    },

    executor: async (context, callbacks) => {
        if (context.args.length === 0) {
            // Ayuda general: combinar comandos + símbolos
            const { getSymbolsSummary } = await import('../inputProcessor');
            const commandsHelp = commandRegistry.getGeneralHelp();
            const symbolsHelp = getSymbolsSummary(context.sheetId);

            callbacks.text(`${commandsHelp}\n---\n\n${symbolsHelp}`);
        } else {
            // Ayuda específica de comando
            const commandHelp = commandRegistry.getCommandHelp(context.args[0]);
            callbacks.text(commandHelp);
        }
    }
};