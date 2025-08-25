import { create, all } from "mathjs";

const math = create(all);
const sheetScopes = new Map<string, Map<string, any>>();

function getSheetScope(sheetId: string): Map<string, any> {
  if (!sheetScopes.has(sheetId)) {
    sheetScopes.set(sheetId, new Map());
  }
  return sheetScopes.get(sheetId)!;
}
export interface ProcessorCallbacks {
  text: (result: string) => void;
  image: (imageUrl: string) => void;
}

export interface ProcessInputParams {
  input: string;
  sheetId: string;
  cellNumber: number;
  callbacks: ProcessorCallbacks;
}

/**
 * Procesa la entrada del usuario y determina el tipo de respuesta
 * basado en si el número de celda es par o impar
 */
export function processUserInput({ input, sheetId, cellNumber, callbacks }: ProcessInputParams): void {
  const scope = getSheetScope(sheetId);
  
  // Determinar tipo de respuesta basado en número de celda
  if (cellNumber % 2 === 0) {
    // Par: respuesta de texto
    try {
      const exp = math.parse(input).compile().evaluate(scope);
      callbacks.text(String(exp));
    } catch (error) {
      callbacks.text(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  } else {
    // Impar: respuesta de imagen
    callbacks.image('https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=600');
  }

  callbacks.text(exp);
}