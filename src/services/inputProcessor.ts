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

export function processUserInput({ input, sheetId, cellNumber, callbacks }: ProcessInputParams): void {
  const scope = getSheetScope(sheetId);
  
    try {
      const exp = math.parse(input).compile().evaluate(scope);
    } catch (error) {
      callbacks.text(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }

  if(typeof exp !== "function") callbacks.text(String(exp));
  if(typeof exp === "function") callbacks.text(math.parse(exp).toString());
}