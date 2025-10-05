import { clearCommand } from "./clearCommand";
import { deriveCommand } from "./deriveCommand";
import { helpCommand } from "./helpCommand";
import { matrixCommand } from "./matrixCommand";
import { plotCommand } from "./plotCommand";
import { solveCommand } from "./solveCommand";
import { commandRegistry } from '../customCommandSystem';

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
