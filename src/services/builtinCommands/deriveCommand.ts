import { CustomCommand } from '../customCommandSystem';


/**
 * Comando Derive - Derivadas simbólicas
 */
export const deriveCommand: CustomCommand = {
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