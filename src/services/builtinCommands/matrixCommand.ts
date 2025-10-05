import { CustomCommand, CommandUtils } from '../customCommandSystem';


/**
 * Comando Matrix - Operaciones con matrices
 */
export const matrixCommand: CustomCommand = {
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