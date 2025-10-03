import { commandRegistry, CustomCommand, CommandUtils } from './customCommandSystem';
import { PlotCommandParser } from './plotCommandParser';
import { clearSheetMemory } from './inputProcessor';

/**
 * Comando Plot - Migrado del sistema existente
 */
const plotCommand: CustomCommand = {
    name: 'plot',
    aliases: ['plot'],
    description: 'Grafica funciones matemáticas',
    usage: 'plot {función1, función2, ...} from min to max',

    matcher: CommandUtils.prefixMatcher('plot '),
    parser: CommandUtils.restParser,

    executor: (context, callbacks) => {
        const plotConfig = PlotCommandParser.parse(context.input);
        if (plotConfig) {
            callbacks.plot(plotConfig);
        } else {
            callbacks.error(`Formato incorrecto para plot.

${PlotCommandParser.getHelp()}`);
        }
    },

    getHelp: () => PlotCommandParser.getHelp()
};

/**
 * Comando Help - Sistema de ayuda
 */
const helpCommand: CustomCommand = {
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
            const { getSymbolsSummary } = await import('./inputProcessor');
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

/**
 * Comando Clear - Limpia memoria
 */
const clearCommand: CustomCommand = {
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

/**
 * Comando Solve - Resuelve ecuaciones
 */
const solveCommand: CustomCommand = {
    name: 'solve',
    description: 'Resuelve ecuaciones algebraicas',
    usage: 'solve <ecuación> for <variable>',

    matcher: CommandUtils.prefixMatcher('solve '),
    parser: CommandUtils.regexParser(/solve\s+(.+?)\s+for\s+(\w+)/i),

    executor: async (context, callbacks) => {
        if (context.args.length < 2) {
            callbacks.error('Formato: solve <ecuación> for <variable>\nEjemplo: solve x^2 - 4 = 0 for x');
            return;
        }

        try {
            // Importar Algebrite para resolución simbólica
            const Algebrite = await import('algebrite') as { run: (expression: string) => string };

            const equation = context.args[0];
            const variable = context.args[1];

            // Convertir ecuación al formato que espera Algebrite
            // De "x + 2 = 2" a "x + 2 - 2"
            const sides = equation.split('=');
            if (sides.length !== 2) {
                callbacks.error('La ecuación debe tener el formato: expresión = expresión');
                return;
            }

            const leftSide = sides[0].trim();
            const rightSide = sides[1].trim();

            // Crear la expresión igualada a cero
            const expression = `${leftSide} - (${rightSide})`;

            // Usar Algebrite para resolver la ecuación
            const solutionResult = Algebrite.run(`roots(${expression})`);

            // Procesar el resultado

            if (!solutionResult || solutionResult.trim() === '') {
                // Si Algebrite no encuentra solución, intentar evaluación numérica
                try {
                    const numericResult = Algebrite.run(`float(roots(${expression}))`);

                    if (numericResult && numericResult.trim() !== '') {
                        callbacks.text(`🔍 **Solución numérica para ${equation}:**

${variable} = ${numericResult}

*Resuelto usando métodos numéricos*`);
                    } else {
                        callbacks.text(`🔍 **No se encontró solución para:**
${equation}

*La ecuación podría no tener solución real o estar fuera del alcance del solucionador.*`);
                    }
                } catch (numError) {
                    callbacks.text(`🔍 **No se encontró solución para:**
${equation}

*Error: ${numError instanceof Error ? numError.message : 'Error desconocido'}*`);
                }
            } else {
                // Formatear la solución
                let formattedSolution = solutionResult;

                // Si es un array de soluciones, formatear mejor
                if (solutionResult.includes('[') && solutionResult.includes(']')) {
                    formattedSolution = solutionResult.replace(/\[|\]/g, '').split(',').map((s: string) => s.trim()).join(', ');
                }

                callbacks.text(`🔍 **Solución para ${equation}:**

${variable} = ${formattedSolution}

*Resuelto simbólicamente usando Algebrite*`);
            }

        } catch (error) {
            console.error('Error en solve command:', error);
            callbacks.error(`Error resolviendo la ecuación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
};

/**
 * Comando Matrix - Operaciones con matrices
 */
const matrixCommand: CustomCommand = {
    name: 'matrix',
    aliases: ['mat'],
    description: 'Realiza operaciones con matrices',
    usage: 'matrix <operación> <matriz1> [matriz2]',

    matcher: CommandUtils.prefixMatcher('matrix '),
    parser: CommandUtils.simpleParser,

    executor: async (context, callbacks) => {
        if (context.args.length < 2) {
            callbacks.text(`🧮 **Operaciones de Matrix disponibles:**

**Operaciones básicas:**
• \`matrix det [[1,2],[3,4]]\` - Determinante
• \`matrix inv [[1,2],[3,4]]\` - Inversa
• \`matrix transpose [[1,2,3],[4,5,6]]\` - Transpuesta

**Operaciones con dos matrices:**
• \`matrix multiply A B\` - Multiplicación
• \`matrix add A B\` - Suma
• \`matrix subtract A B\` - Resta

**Ejemplos:**
\`matrix det [[2,3],[1,4]]\`
\`matrix inv [[1,0],[0,1]]\``);
            return;
        }

        try {
            const math = await import('mathjs');
            const operation = context.args[0];
            const matrixStr = context.args[1];

            // Evaluar la matriz
            const matrix = math.evaluate(matrixStr);

            let result;
            switch (operation.toLowerCase()) {
                case 'det':
                case 'determinant':
                    result = math.det(matrix);
                    callbacks.text(`🧮 **Determinante:** ${result}`);
                    break;

                case 'inv':
                case 'inverse':
                    result = math.inv(matrix);
                    callbacks.text(`🧮 **Matriz Inversa:**\n\`\`\`\n${math.format(result, { precision: 4 })}\n\`\`\``);
                    break;

                case 'transpose':
                case 'T':
                    result = math.transpose(matrix);
                    callbacks.text(`🧮 **Matriz Transpuesta:**\n\`\`\`\n${math.format(result)}\n\`\`\``);
                    break;

                default:
                    callbacks.error(`Operación '${operation}' no reconocida. Usa 'matrix' sin argumentos para ver las operaciones disponibles.`);
            }
        } catch (error) {
            callbacks.error(`Error en operación matrix: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
};

/**
 * Comando Derive - Derivadas simbólicas
 */
const deriveCommand: CustomCommand = {
    name: 'derive',
    aliases: ['d/dx', 'derivative'],
    description: 'Calcula derivadas simbólicas',
    usage: 'derive <función> [variable]',

    matcher: (input: string) => {
        const lower = input.toLowerCase();
        return lower.startsWith('derive ') || lower.startsWith('d/dx ');
    },

    parser: (input: string) => {
        // Extraer después de 'derive ' o 'd/dx '
        const match = input.match(/(?:derive|d\/dx)\s+(.+)/i);
        return match ? match[1].split(/\s+/) : [];
    },

    executor: async (context, callbacks) => {
        if (context.args.length < 1) {
            callbacks.error('Formato: derive <función> [variable]\nEjemplo: derive x^2 + 3*x');
            return;
        }

        try {
            const math = await import('mathjs');
            const expression = context.args[0];
            const variable = context.args[1] || 'x';

            const derivative = math.derivative(expression, variable);

            callbacks.text(`📐 **Derivada de ${expression} respecto a ${variable}:**
      
\`${derivative.toString()}\`

**Simplificada:** \`${math.simplify(derivative.toString()).toString()}\``);
        } catch (error) {
            callbacks.error(`Error calculando derivada: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
};

/**
 * Registra todos los comandos built-in
 */
export function registerBuiltinCommands(): void {
    commandRegistry.register(plotCommand);
    commandRegistry.register(helpCommand);
    commandRegistry.register(clearCommand);
    commandRegistry.register(solveCommand);
    commandRegistry.register(matrixCommand);
    commandRegistry.register(deriveCommand);

    console.log('🚀 Comandos built-in registrados correctamente');
}
