import { PlotConfig } from '../components/FunctionPlot';

/**
 * Parser para el comando plot
 * Formato soportado:
 * - plot {función1, función2} from minXvalue to maxXvalue
 */
export class PlotCommandParser {
    static parse(command: string): PlotConfig | null {
        try {
            // Remover "plot " del inicio
            const content = command.substring(5).trim();

            // Expresión regular para capturar: {funciones} from minX to maxX
            const plotRegex = /^\{([^}]+)\}\s+from\s+(-?\d*\.?\d+)\s+to\s+(-?\d*\.?\d+)$/i;
            const match = content.match(plotRegex);

            if (!match) {
                throw new Error('Formato incorrecto. Use: plot {función1, función2} from minXvalue to maxXvalue');
            }

            const [, functionsStr, minXStr, maxXStr] = match;

            // Parsear las funciones separadas por coma
            const functions = functionsStr
                .split(',')
                .map(f => f.trim())
                .filter(f => f.length > 0);

            if (functions.length === 0) {
                throw new Error('No se especificaron funciones para graficar');
            }

            const config: PlotConfig = {
                functions,
                xMin: parseFloat(minXStr),
                xMax: parseFloat(maxXStr),
                steps: 200,
            };

            return config;
        } catch (error) {
            console.error('Error parsing plot command:', error);
            return null;
        }
    }

    /**
     * Genera ayuda para el comando plot
     */
    static getHelp(): string {
        return `
📊 Comando PLOT - Ayuda

Sintaxis:
  plot {función1, función2, ...} from minXvalue to maxXvalue

Ejemplos:
  plot {x^2} from -5 to 5
  plot {sin(x), cos(x)} from -10 to 10
  plot {x^2, x^3, sqrt(x)} from 0 to 5
  plot {tan(x)} from -3.14 to 3.14

Funciones soportadas:
  - Básicas: +, -, *, /, ^
  - Trigonométricas: sin, cos, tan, asin, acos, atan
  - Logarítmicas: log, ln, log10
  - Otras: sqrt, abs, exp, floor, ceil
  - Variables definidas por el usuario
`.trim();
    }
}