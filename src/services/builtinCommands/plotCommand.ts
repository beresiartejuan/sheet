import { CustomCommand, CommandUtils } from '../customCommandSystem';
import { PlotCommandParser } from '../plotCommandParser';
/**
 * Comando Plot - Migrado del sistema existente
 */
export const plotCommand: CustomCommand = {
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