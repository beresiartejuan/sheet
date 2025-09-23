import { create, all } from "mathjs";

const math = create(all);
const sheetScopes = new Map<string, Map<string, unknown>>();

function getSheetScope(sheetId: string): Map<string, unknown> {
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

export function processUserInput({ input, sheetId, callbacks }: ProcessInputParams): void {
  const scope = getSheetScope(sheetId);

  try {
    // Limpiar la entrada
    const cleanInput = input.trim();
    if (!cleanInput) {
      callbacks.text('');
      return;
    }

    const node = math.parse(cleanInput);
    const compiled = node.compile();
    const result = compiled.evaluate(scope);

    // Convertir el resultado a string si es necesario
    const resultString = typeof result === 'string' ? result : String(result);
    callbacks.text(resultString);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    callbacks.text(`Error: ${errorMessage}`);
  }
}