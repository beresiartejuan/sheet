import { CustomCommand, CommandUtils } from '../customCommandSystem';


/**
 * Comando Solve - Resuelve ecuaciones
 */
export const solveCommand: CustomCommand = {
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
                        callbacks.text(`${variable} = ${numericResult}`);
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

                callbacks.text(`${variable} = ${formattedSolution}`);
            }

        } catch (error) {
            console.error('Error en solve command:', error);
            callbacks.error(`Error resolviendo la ecuación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
};