import { mathScopeManager } from './mathScopeManager';
import { symbolMemory, StoredFunction, StoredVariable } from './symbolMemory';
import { PlotCommandParser } from './plotCommandParser';
import { PlotConfig } from '../components/FunctionPlot';
export interface ProcessorCallbacks {
  text: (result: string) => void;
  image: (imageUrl: string) => void;
  plot: (config: PlotConfig) => void;
}

export interface ProcessInputParams {
  input: string;
  sheetId: string;
  cellNumber: number;
  callbacks: ProcessorCallbacks;
}

export function processUserInput({ input, sheetId, callbacks }: ProcessInputParams): void {
  try {
    const cleanInput = input.trim();
    if (!cleanInput) {
      callbacks.text('');
      return;
    }

    // Comandos especiales
    if (cleanInput.toLowerCase() === 'help' || cleanInput === '?') {
      callbacks.text(getSymbolsSummary(sheetId));
      return;
    }

    if (cleanInput.toLowerCase() === 'clear') {
      clearSheetMemory(sheetId);
      callbacks.text('Memoria limpiada. Todas las funciones y variables han sido eliminadas.');
      return;
    }

    // Comando plot
    if (cleanInput.toLowerCase().startsWith('plot ')) {
      const plotConfig = PlotCommandParser.parse(cleanInput);
      if (plotConfig) {
        // SOLO llamar al callback plot, no al de text
        callbacks.plot(plotConfig);
      } else {
        callbacks.text(`Error: Formato incorrecto. 
        
${PlotCommandParser.getHelp()}`);
      }
      return;
    }

    // Help específico para plot
    if (cleanInput.toLowerCase() === 'plot help' || cleanInput.toLowerCase() === 'help plot') {
      callbacks.text(PlotCommandParser.getHelp());
      return;
    }

    const node = mathScopeManager.parse(cleanInput);
    const scope = mathScopeManager.getScope(sheetId);
    const compiled = node.compile();
    const result = compiled.evaluate(scope);

    console.log({ nodeType: node.type, result: result });

    /**
     * Si el nodo es FunctionAssignmentNode quiere decir que el usuario está registrando una nueva función
     */
    if (node.type === "FunctionAssignmentNode") {
      // Extraer información de la función usando propiedades conocidas
      const functionNode = node as unknown as { name: string; params: string[] };
      const functionName = functionNode.name || 'función';
      const parameters = functionNode.params || [];

      // Almacenar la versión original para mostrar al usuario
      symbolMemory.storeFunction(sheetId, functionName, cleanInput, parameters);

      callbacks.text(cleanInput);
      return;
    }

    /**
     * Si el nodo es AssignmentNode quiere decir que se está asignando una variable
     */
    if (node.type === "AssignmentNode") {
      const assignmentNode = node as unknown as { name: string };
      const variableName = assignmentNode.name || 'variable';

      // Almacenar la versión original para mostrar al usuario
      symbolMemory.storeVariable(sheetId, variableName, cleanInput, result);

      callbacks.text(`${variableName} = ${String(result)}`);
      return;
    }

    /**
     * Si el nodo es SymbolNode quiere decir que se quiere consultar el estado de una variable o función
     */
    if (node.type === "SymbolNode") {
      const symbolName = node.toString();
      const storedSymbol = symbolMemory.getSymbol(sheetId, symbolName);

      if (storedSymbol) {
        // Mostrar la versión original amigable para el usuario
        if (storedSymbol.type === 'function') {
          const func = storedSymbol as StoredFunction;
          const definition = func.originalExpression.split('=')[1]?.trim() || 'definición no disponible';
          callbacks.text(`${func.name}(${func.parameters.join(', ')}) = ${definition}`);
        } else {
          const definition = storedSymbol.originalExpression.split('=')[1]?.trim() || String(result);
          callbacks.text(`${storedSymbol.name} = ${definition}`);
        }
        return;
      }

      // Si no está en memoria pero existe en scope, mostrar el resultado calculado
      if (typeof result === "function") {
        callbacks.text(`[Función compilada: ${symbolName}]`);
        return;
      }
    }

    // Para cualquier otra expresión, mostrar el resultado calculado
    const resultString = typeof result === 'string' ? result : String(result);
    callbacks.text(resultString);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    callbacks.text(`[Error]: ${errorMessage}`);
  }
}

/**
 * Obtiene todas las funciones definidas por el usuario en una hoja
 */
export function getUserFunctions(sheetId: string): StoredFunction[] {
  return symbolMemory.getFunctions(sheetId);
}

/**
 * Obtiene todas las variables definidas por el usuario en una hoja
 */
export function getUserVariables(sheetId: string): StoredVariable[] {
  return symbolMemory.getVariables(sheetId);
}

/**
 * Obtiene todos los símbolos definidos por el usuario en una hoja
 */
export function getAllUserSymbols(sheetId: string) {
  return symbolMemory.getAllSymbols(sheetId);
}

/**
 * Limpia toda la memoria de símbolos de una hoja
 */
export function clearSheetMemory(sheetId: string): void {
  symbolMemory.clearSheet(sheetId);
  mathScopeManager.clearScope(sheetId);
}

/**
 * Genera un resumen legible de todos los símbolos disponibles en una hoja
 */
export function getSymbolsSummary(sheetId: string): string {
  const functions = getUserFunctions(sheetId);
  const variables = getUserVariables(sheetId);

  if (functions.length === 0 && variables.length === 0) {
    return 'No hay símbolos definidos en esta hoja.';
  }

  let summary = '';

  if (functions.length > 0) {
    summary += '📋 Funciones definidas:\n';
    functions.forEach(func => {
      const definition = func.originalExpression.split('=')[1]?.trim() || 'definición no disponible';
      summary += `  • ${func.name}(${func.parameters.join(', ')}) = ${definition}\n`;
    });
  }

  if (variables.length > 0) {
    if (summary) summary += '\n';
    summary += '📊 Variables definidas:\n';
    variables.forEach(variable => {
      const definition = variable.originalExpression.split('=')[1]?.trim() || String(variable.value);
      summary += `  • ${variable.name} = ${definition}\n`;
    });
  }

  return summary.trim();
}