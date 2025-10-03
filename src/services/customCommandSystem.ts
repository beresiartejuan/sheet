import { PlotConfig } from '../components/FunctionPlot';

/**
 * Contexto que se pasa a los comandos personalizados
 */
export interface CommandContext {
    input: string;
    sheetId: string;
    cellNumber: number;
    args: string[];
    rawArgs: string;
}

/**
 * Callbacks disponibles para los comandos
 */
export interface CommandCallbacks {
    text: (result: string) => void;
    image: (imageUrl: string) => void;
    plot: (config: PlotConfig) => void;
    error: (message: string) => void;
}

/**
 * Definición de un comando personalizado
 */
export interface CustomCommand {
    /**
     * Nombre del comando (ej: 'plot', 'solve', 'matrix')
     */
    name: string;

    /**
     * Aliases opcionales (ej: ['graph', 'chart'] para plot)
     */
    aliases?: string[];

    /**
     * Descripción del comando para el help
     */
    description: string;

    /**
     * Ejemplo de uso
     */
    usage: string;

    /**
     * Función que determina si el input coincide con este comando
     * Permite sintaxis flexible (no solo prefijos)
     */
    matcher: (input: string) => boolean;

    /**
     * Parser que extrae argumentos del input
     */
    parser: (input: string) => string[];

    /**
     * Ejecutor del comando
     */
    executor: (context: CommandContext, callbacks: CommandCallbacks) => void | Promise<void>;

    /**
     * Ayuda específica del comando
     */
    getHelp?: () => string;
}

/**
 * Registry de comandos personalizados
 */
class CommandRegistry {
    private commands: Map<string, CustomCommand> = new Map();
    private aliases: Map<string, string> = new Map();

    /**
     * Registra un nuevo comando
     */
    register(command: CustomCommand): void {
        // Registrar comando principal
        this.commands.set(command.name.toLowerCase(), command);

        // Registrar aliases
        if (command.aliases) {
            command.aliases.forEach(alias => {
                this.aliases.set(alias.toLowerCase(), command.name.toLowerCase());
            });
        }

        console.log(`✅ Comando registrado: ${command.name}${command.aliases ? ` (aliases: ${command.aliases.join(', ')})` : ''}`);
    }

    /**
     * Busca si algún comando puede manejar el input
     */
    findMatchingCommand(input: string): CustomCommand | null {
        const trimmedInput = input.trim();

        // Primero buscar por matchers personalizados
        for (const [, command] of this.commands) {
            if (command.matcher(trimmedInput)) {
                return command;
            }
        }

        return null;
    }

    /**
     * Ejecuta un comando si encuentra coincidencia
     */
    async tryExecute(
        input: string,
        sheetId: string,
        cellNumber: number,
        callbacks: CommandCallbacks
    ): Promise<boolean> {
        const command = this.findMatchingCommand(input);

        if (!command) {
            return false; // No se encontró comando
        }

        try {
            const args = command.parser(input);
            const context: CommandContext = {
                input,
                sheetId,
                cellNumber,
                args,
                rawArgs: args.join(' ')
            };

            console.log(`🚀 Ejecutando comando: ${command.name}`);
            await command.executor(context, callbacks);
            console.log(`✅ Comando ${command.name} ejecutado exitosamente`);
            return true; // Comando ejecutado exitosamente
        } catch (error) {
            callbacks.error(`Error en comando '${command.name}': ${error instanceof Error ? error.message : 'Error desconocido'}`);
            return true; // Comando se intentó ejecutar (aunque falló)
        }
    }

    /**
     * Lista todos los comandos registrados
     */
    getCommands(): CustomCommand[] {
        return Array.from(this.commands.values());
    }

    /**
     * Obtiene ayuda general de todos los comandos
     */
    getGeneralHelp(): string {
        const commands = this.getCommands();

        if (commands.length === 0) {
            return 'No hay comandos personalizados registrados.';
        }

        let help = '📚 **Comandos Disponibles:**\n\n';

        commands.forEach(command => {
            const aliases = command.aliases ? ` (${command.aliases.join(', ')})` : '';
            help += `🔸 **${command.name}${aliases}**\n`;
            help += `   ${command.description}\n`;
            help += `   Uso: \`${command.usage}\`\n\n`;
        });

        return help;
    }

    /**
     * Obtiene ayuda específica de un comando
     */
    getCommandHelp(commandName: string): string {
        const normalizedName = commandName.toLowerCase();
        const actualName = this.aliases.get(normalizedName) || normalizedName;
        const command = this.commands.get(actualName);

        if (!command) {
            return `Comando '${commandName}' no encontrado.`;
        }

        if (command.getHelp) {
            return command.getHelp();
        }

        let help = `📖 **Ayuda: ${command.name}**\n\n`;
        help += `**Descripción:** ${command.description}\n`;
        help += `**Uso:** ${command.usage}\n`;

        if (command.aliases && command.aliases.length > 0) {
            help += `**Aliases:** ${command.aliases.join(', ')}\n`;
        }

        return help;
    }
}

// Singleton del registry
export const commandRegistry = new CommandRegistry();

/**
 * Utilidades para crear comandos comunes
 */
export class CommandUtils {
    /**
     * Matcher simple por prefijo
     */
    static prefixMatcher(prefix: string): (input: string) => boolean {
        return (input: string) => input.toLowerCase().startsWith(prefix.toLowerCase());
    }

    /**
     * Matcher por regex
     */
    static regexMatcher(pattern: RegExp): (input: string) => boolean {
        return (input: string) => pattern.test(input);
    }

    /**
     * Parser simple que separa por espacios
     */
    static simpleParser(input: string): string[] {
        return input.trim().split(/\s+/).slice(1); // Omite la primera palabra (comando)
    }

    /**
     * Parser que mantiene el texto completo después del comando
     */
    static restParser(input: string): string[] {
        const parts = input.trim().split(/\s+/);
        return parts.length > 1 ? [parts.slice(1).join(' ')] : [];
    }

    /**
     * Parser personalizado con regex
     */
    static regexParser(pattern: RegExp): (input: string) => string[] {
        return (input: string) => {
            const match = input.match(pattern);
            return match ? Array.from(match).slice(1) : [];
        };
    }
}
